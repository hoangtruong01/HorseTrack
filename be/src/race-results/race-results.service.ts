import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { RacesService } from '../races/races.service';
import { RaceStatus } from '../races/schemas/race.schema';
import {
  Registration,
  RegistrationDocument,
  RegistrationStatus,
} from '../registrations/schemas/registration.schema';
import {
  RefereeAssignment,
  RefereeAssignmentDocument,
  RefereeAssignmentStatus,
} from '../referee-assignments/schemas/referee-assignment.schema';
import { CreateRaceResultDto } from './dto/create-race-result.dto';
import {
  RaceResult,
  RaceResultDocument,
  RaceResultOutcome,
  RaceResultStatus,
} from './schemas/race-result.schema';
import { PredictionsService } from '../predictions/predictions.service';
import { PrizesService } from '../prizes/prizes.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

/** Points by finishing rank */
const POINTS_MAP: Record<number, number> = { 1: 10, 2: 7, 3: 5, 4: 3 };
const DEFAULT_POINTS = 1;

@Injectable()
export class RaceResultsService {
  constructor(
    @InjectModel(RaceResult.name)
    private resultModel: Model<RaceResultDocument>,
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
    @InjectModel(RefereeAssignment.name)
    private assignmentModel: Model<RefereeAssignmentDocument>,
    private racesService: RacesService,
    private prizesService: PrizesService,
    private predictionsService: PredictionsService,
    private auditLogsService: AuditLogsService,
  ) {}

  private async validateRefereeAssigned(
    raceId: string,
    refereeUserId: string,
  ): Promise<void> {
    const assignment = await this.assignmentModel.findOne({
      raceId,
      refereeUserId,
      status: RefereeAssignmentStatus.ACCEPTED,
    });
    if (!assignment) {
      throw new ForbiddenException(
        'You are not an accepted referee for this race',
      );
    }
  }

  async create(
    dto: CreateRaceResultDto,
    recordedBy: string,
  ): Promise<RaceResultDocument> {
    const race = await this.racesService.findOne(dto.raceId);

    // Race must be LIVE or FINISHED to record results
    if (
      race.status !== RaceStatus.LIVE &&
      race.status !== RaceStatus.FINISHED
    ) {
      throw new BadRequestException(
        'Can only record results for LIVE or FINISHED races',
      );
    }

    // Only accepted referee can record
    await this.validateRefereeAssigned(dto.raceId, recordedBy);

    // Cross-field validation: rank ↔ outcome
    if (dto.outcome === RaceResultOutcome.FINISHED && !dto.rank) {
      throw new BadRequestException(
        'rank is required when outcome is FINISHED',
      );
    }
    if (dto.outcome !== RaceResultOutcome.FINISHED && dto.rank) {
      throw new BadRequestException(
        'rank must not be set for non-FINISHED outcomes',
      );
    }

    // Validate registration exists and is APPROVED
    const registration = await this.registrationModel.findById(
      dto.raceRegistrationId,
    );
    if (!registration || registration.status !== RegistrationStatus.APPROVED) {
      throw new BadRequestException(
        'Registration not found or not approved for this race',
      );
    }

    // Duplicate horse check
    const existingHorse = await this.resultModel.findOne({
      raceId: dto.raceId,
      horseId: dto.horseId,
    });
    if (existingHorse) {
      throw new ConflictException(
        'Result already exists for this horse in this race',
      );
    }

    // Rank duplicate check (only for FINISHED outcome)
    if (dto.outcome === RaceResultOutcome.FINISHED && dto.rank) {
      const existingRank = await this.resultModel.findOne({
        raceId: dto.raceId,
        rank: dto.rank,
        outcome: RaceResultOutcome.FINISHED,
      });
      if (existingRank) {
        throw new BadRequestException(
          `Rank ${dto.rank} is already taken in this race`,
        );
      }
    }

    const points =
      dto.outcome === RaceResultOutcome.FINISHED && dto.rank
        ? (POINTS_MAP[dto.rank] ?? DEFAULT_POINTS)
        : 0;

    return this.resultModel.create({
      tournamentId: race.tournamentId,
      raceId: new Types.ObjectId(dto.raceId),
      raceRegistrationId: new Types.ObjectId(dto.raceRegistrationId),
      horseId: new Types.ObjectId(dto.horseId),
      ownerId: registration.ownerId,
      jockeyUserId: registration.jockeyUserId,
      rank: dto.rank,
      finishTimeMs: dto.finishTimeMs,
      outcome: dto.outcome,
      points,
      prizeAmount: 0,
      note: dto.note,
      recordedBy: new Types.ObjectId(recordedBy),
    });
  }

  async findByRace(raceId: string) {
    return this.resultModel
      .find({ raceId, status: RaceResultStatus.PUBLISHED })
      .populate('horseId', 'name breed')
      .populate('jockeyUserId', 'fullName')
      .populate('recordedBy', 'fullName')
      .sort({ rank: 1 })
      .exec();
  }

  async findByTournament(tournamentId: string) {
    return this.resultModel
      .find({ tournamentId, status: RaceResultStatus.PUBLISHED })
      .populate('raceId', 'name raceNumber')
      .populate('horseId', 'name breed')
      .populate('jockeyUserId', 'fullName')
      .sort({ raceId: 1, rank: 1 })
      .exec();
  }

  async confirmResultsForRace(raceId: string, refereeId: string) {
    await this.validateRefereeAssigned(raceId, refereeId);

    const results = await this.resultModel.find({ raceId });
    if (results.length === 0) {
      throw new BadRequestException('No results recorded for this race yet');
    }

    // All results must be DRAFT to confirm
    const alreadyConfirmed = results.some(
      (r) => r.status === RaceResultStatus.CONFIRMED,
    );
    if (alreadyConfirmed) {
      throw new BadRequestException('Results have already been confirmed');
    }

    // All APPROVED registrations must have a result
    const approvedCount = await this.registrationModel.countDocuments({
      raceId,
      status: RegistrationStatus.APPROVED,
    });
    if (results.length < approvedCount) {
      throw new BadRequestException(
        `Results are incomplete. Recorded ${results.length}/${approvedCount} horses.`,
      );
    }

    await this.resultModel.updateMany(
      { raceId, status: RaceResultStatus.DRAFT },
      {
        $set: {
          status: RaceResultStatus.CONFIRMED,
          confirmedBy: refereeId,
          confirmedAt: new Date(),
        },
      },
    );

    return { message: 'Results confirmed by referee' };
  }

  async publishByRace(raceId: string, publishedBy: string) {
    const race = await this.racesService.findOne(raceId);

    if (race.status !== RaceStatus.FINISHED) {
      throw new BadRequestException(
        'Race must be in FINISHED status before results can be published',
      );
    }

    const results = await this.resultModel.find({ raceId });
    if (results.length === 0) {
      throw new BadRequestException('No results to publish for this race');
    }

    // All results must be CONFIRMED
    const unconfirmed = results.some(
      (r) => r.status !== RaceResultStatus.CONFIRMED,
    );
    if (unconfirmed) {
      throw new BadRequestException(
        'Cannot publish: some results are not confirmed by the referee yet',
      );
    }

    // Calculate prize amounts from race prize fields
    const prizeByRank: Record<number, number> = {
      1: race.prizeFirst ?? 0,
      2: race.prizeSecond ?? 0,
      3: race.prizeThird ?? 0,
    };

    const now = new Date();
    await Promise.all(
      results.map((result) => {
        const prizeAmount =
          result.outcome === RaceResultOutcome.FINISHED && result.rank
            ? (prizeByRank[result.rank] ?? 0)
            : 0;
        return this.resultModel.findByIdAndUpdate(result._id, {
          $set: {
            status: RaceResultStatus.PUBLISHED,
            prizeAmount,
            publishedBy,
            publishedAt: now,
          },
        });
      }),
    );

    // Update race status to RESULT_PUBLISHED
    await this.racesService.updateStatus(raceId, RaceStatus.RESULT_PUBLISHED);

    // Auto-create prizes (legacy prize records)
    await this.prizesService.createPrizesForRace(raceId);

    // Resolve predictions
    await this.predictionsService.payoutBetsForRace(raceId);

    await this.auditLogsService.log({
      actorId: publishedBy,
      action: 'race_result.publish',
      entityType: 'Race',
      entityId: raceId,
      after: { status: 'RESULT_PUBLISHED', resultCount: results.length },
    });

    return {
      message:
        'Results published, race marked as RESULT_PUBLISHED, prizes generated, predictions resolved',
    };
  }
}
