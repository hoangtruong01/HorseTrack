import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ClientSession, Model, Types } from 'mongoose';
import { TournamentsService } from '../tournaments/tournaments.service';
import { PredictionsService } from '../predictions/predictions.service';
import { TournamentStatus } from '../tournaments/schemas/tournament.schema';
import { CreateRaceDto } from './dto/create-race.dto';
import { UpdateRaceDto } from './dto/update-race.dto';
import { UpdateRaceConditionsDto } from './dto/update-race-conditions.dto';
import {
  Race,
  RaceDocument,
  RaceStatus,
  RACE_STATUS_FLOW,
} from './schemas/race.schema';
import {
  Registration,
  RegistrationDocument,
  RegistrationStatus,
} from '../registrations/schemas/registration.schema';
import {
  RaceCheck,
  RaceCheckDocument,
  RaceCheckStatus,
} from '../race-checks/schemas/race-check.schema';
import {
  RefereeAssignment,
  RefereeAssignmentDocument,
  RefereeAssignmentStatus,
} from '../referee-assignments/schemas/referee-assignment.schema';

const LOCKED_STATUSES = [
  RaceStatus.LIVE,
  RaceStatus.FINISHED,
  RaceStatus.RESULT_PUBLISHED,
];

@Injectable()
export class RacesService {
  constructor(
    @InjectModel(Race.name) private raceModel: Model<RaceDocument>,
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
    @InjectModel(RaceCheck.name)
    private raceCheckModel: Model<RaceCheckDocument>,
    @InjectModel(RefereeAssignment.name)
    private refereeAssignmentModel: Model<RefereeAssignmentDocument>,
    private tournamentsService: TournamentsService,
    private predictionsService: PredictionsService,
  ) {}

  async create(dto: CreateRaceDto, createdBy: string): Promise<RaceDocument> {
    const tournament = await this.tournamentsService.findOne(dto.tournamentId);

    // Validate startTime within tournament dates
    const startTime = new Date(dto.startTime);
    // Allow 12 hours buffer before start date and 36 hours buffer after end date to handle timezone offsets
    const startLimit = new Date(
      tournament.startDate.getTime() - 12 * 60 * 60 * 1000,
    );
    const endLimit = new Date(
      tournament.endDate.getTime() + 36 * 60 * 60 * 1000,
    );
    if (startTime < startLimit || startTime > endLimit) {
      throw new BadRequestException(
        'Race startTime must be within tournament startDate and endDate',
      );
    }

    // Validate prize does not exceed tournament budget
    if (dto.prize !== undefined) {
      const [agg] = await this.raceModel.aggregate<{ total: number }>([
        {
          $match: {
            tournamentId: new Types.ObjectId(dto.tournamentId),
            deletedAt: { $exists: false },
          },
        },
        { $group: { _id: null, total: { $sum: '$prize' } } },
      ]);
      const usedPrize = agg?.total ?? 0;
      if (usedPrize + dto.prize > (tournament.prizePool ?? 0)) {
        throw new BadRequestException(
          `Prize exceeds tournament budget. Used: ${usedPrize}, Available: ${(tournament.prizePool ?? 0) - usedPrize}`,
        );
      }
    }

    return this.raceModel.create({
      ...dto,
      tournamentId: new Types.ObjectId(dto.tournamentId),
      createdBy: new Types.ObjectId(createdBy),
    } as unknown as Partial<RaceDocument>);
  }

  async findAll(page = 1, limit = 20) {
    const filter = { deletedAt: { $exists: false } };
    const [data, total] = await Promise.all([
      this.raceModel
        .find(filter)
        .populate('tournamentId', 'name')
        .populate('createdBy', 'fullName')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ startTime: 1 })
        .exec(),
      this.raceModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findByTournament(tournamentId: string, page = 1, limit = 20) {
    const filter = {
      tournamentId: new Types.ObjectId(tournamentId),
      deletedAt: { $exists: false },
    };
    const [data, total] = await Promise.all([
      this.raceModel
        .find(filter)
        .populate('createdBy', 'fullName')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ startTime: 1 })
        .exec(),
      this.raceModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<RaceDocument> {
    const race = await this.raceModel
      .findById(id)
      .populate('tournamentId', 'name startDate endDate')
      .populate('createdBy', 'fullName')
      .exec();
    if (!race || race.deletedAt) {
      throw new NotFoundException('Race not found');
    }
    return race;
  }

  async update(id: string, dto: UpdateRaceDto): Promise<RaceDocument> {
    const race = await this.findOne(id);
    if (LOCKED_STATUSES.includes(race.status)) {
      throw new BadRequestException(
        'Cannot update a race that is live, finished, or has published results',
      );
    }

    // Validate startTime within tournament dates
    if (dto.startTime !== undefined) {
      const tournament = await this.tournamentsService.findOne(
        this.getTournamentIdString(race.tournamentId),
      );
      const startTime = new Date(dto.startTime);
      const startLimit = new Date(
        tournament.startDate.getTime() - 12 * 60 * 60 * 1000,
      );
      const endLimit = new Date(
        tournament.endDate.getTime() + 36 * 60 * 60 * 1000,
      );
      if (startTime < startLimit || startTime > endLimit) {
        throw new BadRequestException(
          'Race startTime must be within tournament startDate and endDate',
        );
      }
    }

    // Validate prize does not exceed tournament budget
    if (dto.prize !== undefined) {
      const tournament = await this.tournamentsService.findOne(
        this.getTournamentIdString(race.tournamentId),
      );
      const [agg] = await this.raceModel.aggregate<{ total: number }>([
        {
          $match: {
            tournamentId: race.tournamentId,
            deletedAt: { $exists: false },
            _id: { $ne: race._id },
          },
        },
        { $group: { _id: null, total: { $sum: '$prize' } } },
      ]);
      const usedPrize = agg?.total ?? 0;
      if (usedPrize + dto.prize > (tournament.prizePool ?? 0)) {
        throw new BadRequestException(
          `Prize exceeds tournament budget. Used by other races: ${usedPrize}, Available: ${(tournament.prizePool ?? 0) - usedPrize}`,
        );
      }
    }

    Object.assign(race, dto);
    return race.save();
  }

  /** Ghi status thuần (validate transition + guard); KHÔNG cascade tournament. */
  async setStatus(
    id: string,
    status: RaceStatus,
    session?: ClientSession,
  ): Promise<RaceDocument> {
    const race = await this.findOne(id);

    const allowedTransitions = RACE_STATUS_FLOW[race.status] || [];
    if (!allowedTransitions.includes(status)) {
      throw new BadRequestException(
        `Invalid status transition from ${race.status} to ${status}`,
      );
    }

    // Guard: CHECKING → READY requires all checks passed + at least 1 referee accepted
    if (status === RaceStatus.READY) {
      if (!race.trackCondition || !race.weatherSnapshot) {
        throw new BadRequestException(
          'Race cannot be marked READY: trackCondition and weatherSnapshot must be set',
        );
      }
      await this.validateReadyConditions(id);
    }

    if (status === RaceStatus.CANCELLED) {
      await this.predictionsService.cancelPredictionsForRace(id);
    }

    race.status = status;
    return session ? race.save({ session }) : race.save();
  }

  /**
   * Cascade auto-transition tournament theo trạng thái race hiện tại. Chạy NGOÀI transaction.
   * Re-query findOne(id) là CỐ Ý: hàm được gọi standalone sau khi transaction commit
   * (Task 5 publishByRace gọi sau commit), đảm bảo đọc trạng thái đã persist.
   * Trong updateStatus tuần tự, race.status === status vừa set nên kết quả không đổi.
   */
  async syncTournamentStatus(id: string): Promise<void> {
    const race = await this.findOne(id);
    const status = race.status;
    try {
      if (status === RaceStatus.LIVE) {
        const tournament = await this.tournamentsService.findOne(
          this.getTournamentIdString(race.tournamentId),
        );
        if (tournament.status === TournamentStatus.OPEN_REGISTRATION) {
          await this.tournamentsService.updateStatus(
            tournament._id.toString(),
            TournamentStatus.CLOSED_REGISTRATION,
          );
          await this.tournamentsService.updateStatus(
            tournament._id.toString(),
            TournamentStatus.ONGOING,
          );
        } else if (tournament.status === TournamentStatus.CLOSED_REGISTRATION) {
          await this.tournamentsService.updateStatus(
            tournament._id.toString(),
            TournamentStatus.ONGOING,
          );
        }
      } else if (
        [
          RaceStatus.FINISHED,
          RaceStatus.RESULT_PUBLISHED,
          RaceStatus.CANCELLED,
        ].includes(status)
      ) {
        const tournament = await this.tournamentsService.findOne(
          this.getTournamentIdString(race.tournamentId),
        );
        if (tournament.status === TournamentStatus.ONGOING) {
          const activeRacesCount = await this.raceModel.countDocuments({
            tournamentId: race.tournamentId,
            deletedAt: { $exists: false },
            status: {
              $nin: [
                RaceStatus.FINISHED,
                RaceStatus.RESULT_PUBLISHED,
                RaceStatus.CANCELLED,
              ],
            },
          });
          if (activeRacesCount === 0) {
            await this.tournamentsService.updateStatus(
              tournament._id.toString(),
              TournamentStatus.COMPLETED,
            );
          }
        }
      }
    } catch (err) {
      console.error('Failed to automate tournament status transition:', err);
    }
  }

  /** Giữ chữ ký cũ: ghi status + cascade (cho mọi caller hiện tại). */
  async updateStatus(id: string, status: RaceStatus): Promise<RaceDocument> {
    const saved = await this.setStatus(id, status);
    await this.syncTournamentStatus(id);
    return saved;
  }

  /** Enforce pre-race conditions before READY transition */
  private async validateReadyConditions(raceId: string): Promise<void> {
    // 1. At least 1 referee_assignment must be ACCEPTED
    const acceptedReferee = await this.refereeAssignmentModel.findOne({
      raceId: new Types.ObjectId(raceId),
      status: RefereeAssignmentStatus.ACCEPTED,
    });
    if (!acceptedReferee) {
      throw new BadRequestException(
        'Race cannot be marked READY: no referee has accepted the assignment',
      );
    }

    // 2. All APPROVED registrations must have a PASSED race_check and Jockey roll-called (if assigned)
    const approvedRegs = await this.registrationModel.find({
      raceId: new Types.ObjectId(raceId),
      status: RegistrationStatus.APPROVED,
    });
    if (approvedRegs.length === 0) {
      throw new BadRequestException(
        'Race cannot be marked READY: no approved horse registrations',
      );
    }

    const checks = await this.raceCheckModel.find({
      raceId: new Types.ObjectId(raceId),
    });

    for (const reg of approvedRegs) {
      const check = checks.find(
        (c) => String(c.raceRegistrationId) === String(reg._id),
      );

      if (!check) {
        throw new BadRequestException(
          `Race cannot be marked READY: Pre-race check for horse registration ${String(reg._id)} not found`,
        );
      }

      if (check.status !== RaceCheckStatus.PASSED) {
        throw new BadRequestException(
          `Race cannot be marked READY: Horse check status is ${check.status} (not PASSED) for registration ${String(reg._id)}`,
        );
      }

      // If there's an assigned Jockey, verify that they are checked in / roll-called
      if (reg.jockeyUserId && !check.jockeyCheckedIn) {
        throw new BadRequestException(
          `Race cannot be marked READY: Jockey for registration ${String(reg._id)} has not been checked in / roll-called`,
        );
      }
    }
  }

  async updateConditions(
    id: string,
    dto: UpdateRaceConditionsDto,
  ): Promise<RaceDocument> {
    const race = await this.findOne(id);
    if (LOCKED_STATUSES.includes(race.status)) {
      throw new BadRequestException(
        'Cannot update conditions for a race that is live, finished, or has published results',
      );
    }
    Object.assign(race, dto);
    return race.save();
  }

  async softDelete(id: string): Promise<void> {
    const race = await this.findOne(id);
    if (
      race.status === RaceStatus.FINISHED ||
      race.status === RaceStatus.RESULT_PUBLISHED
    ) {
      throw new BadRequestException(
        'Cannot delete a finished or result published race',
      );
    }
    race.deletedAt = new Date();
    await race.save();
  }

  private getTournamentIdString(tournamentId: unknown): string {
    if (!tournamentId) return '';
    if (typeof tournamentId === 'object') {
      if ('_id' in tournamentId && tournamentId._id) {
        const obj = tournamentId;
        return obj._id instanceof Types.ObjectId
          ? obj._id.toHexString()
          : String(obj._id);
      }
      if (tournamentId instanceof Types.ObjectId) {
        return tournamentId.toHexString();
      }
    }
    return typeof tournamentId === 'string' ? tournamentId : '';
  }
}
