import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateTournamentDto } from './dto/create-tournament.dto';
import { UpdateTournamentDto } from './dto/update-tournament.dto';
import {
  Tournament,
  TournamentDocument,
  TournamentStatus,
  TOURNAMENT_STATUS_FLOW,
} from './schemas/tournament.schema';
import { Race, RaceDocument, RaceStatus } from '../races/schemas/race.schema';
import {
  Registration,
  RegistrationDocument,
  RegistrationStatus,
} from '../registrations/schemas/registration.schema';
import {
  Prediction,
  PredictionDocument,
  PredictionStatus,
} from '../predictions/schemas/prediction.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { RewardPointLedgerService } from '../reward-point-ledger/reward-point-ledger.service';
import { LedgerSourceType } from '../reward-point-ledger/schemas/reward-point-ledger.schema';

@Injectable()
export class TournamentsService {
  constructor(
    @InjectModel(Tournament.name)
    private tournamentModel: Model<TournamentDocument>,
    @InjectModel(Race.name) private raceModel: Model<RaceDocument>,
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
    @InjectModel(Prediction.name)
    private predictionModel: Model<PredictionDocument>,
    private notificationsService: NotificationsService,
    private auditLogsService: AuditLogsService,
    private ledgerService: RewardPointLedgerService,
  ) {}

  async create(
    dto: CreateTournamentDto,
    createdBy: string,
  ): Promise<TournamentDocument> {
    if (new Date(dto.startDate) >= new Date(dto.endDate)) {
      throw new BadRequestException('startDate must be before endDate');
    }
    if (
      dto.registrationStartDate &&
      dto.registrationEndDate &&
      new Date(dto.registrationStartDate) >= new Date(dto.registrationEndDate)
    ) {
      throw new BadRequestException(
        'registrationStartDate must be before registrationEndDate',
      );
    }
    return this.tournamentModel.create({
      ...dto,
      createdBy: new Types.ObjectId(createdBy),
    });
  }

  async findAll(page = 1, limit = 20) {
    const filter = { deletedAt: { $exists: false } };
    const [data, total] = await Promise.all([
      this.tournamentModel
        .find(filter)
        .populate('createdBy', 'fullName email')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.tournamentModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<TournamentDocument> {
    const tournament = await this.tournamentModel
      .findById(id)
      .populate('createdBy', 'fullName email')
      .exec();
    if (!tournament || tournament.deletedAt) {
      throw new NotFoundException('Tournament not found');
    }
    return tournament;
  }

  async update(
    id: string,
    dto: UpdateTournamentDto,
  ): Promise<TournamentDocument> {
    const tournament = await this.findOne(id);

    if (dto.startDate && dto.endDate) {
      if (new Date(dto.startDate) >= new Date(dto.endDate)) {
        throw new BadRequestException('startDate must be before endDate');
      }
    }

    if (
      tournament.status === TournamentStatus.COMPLETED ||
      tournament.status === TournamentStatus.CANCELLED
    ) {
      throw new BadRequestException(
        'Cannot update a completed or cancelled tournament',
      );
    }

    Object.assign(tournament, dto);
    return tournament.save();
  }

  async updateStatus(
    id: string,
    newStatus: TournamentStatus,
    actorId?: string,
  ): Promise<TournamentDocument> {
    const tournament = await this.findOne(id);
    const allowed = TOURNAMENT_STATUS_FLOW[tournament.status];

    if (!allowed.includes(newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${tournament.status} to ${newStatus}`,
      );
    }

    const now = new Date();

    if (newStatus === TournamentStatus.OPEN_REGISTRATION) {
      const raceCount = await this.raceModel.countDocuments({
        tournamentId: new Types.ObjectId(id),
        status: { $ne: RaceStatus.CANCELLED },
        deletedAt: { $exists: false },
      });
      if (raceCount === 0) {
        throw new BadRequestException(
          'Cannot open registration: tournament has no races',
        );
      }
      if (
        tournament.registrationStartDate &&
        now < tournament.registrationStartDate
      ) {
        throw new BadRequestException(
          'Cannot open registration: registration start date has not been reached yet',
        );
      }
      if (
        tournament.registrationEndDate &&
        now >= tournament.registrationEndDate
      ) {
        throw new BadRequestException(
          'Cannot open registration: registration period has already ended',
        );
      }
    }

    if (newStatus === TournamentStatus.ONGOING && now < tournament.startDate) {
      throw new BadRequestException(
        'Cannot start tournament: start date has not been reached yet',
      );
    }

    if (newStatus === TournamentStatus.COMPLETED && now < tournament.endDate) {
      throw new BadRequestException(
        'Cannot complete tournament: end date has not been reached yet',
      );
    }

    if (newStatus === TournamentStatus.CANCELLED) {
      await this.cascadeCancel(id, tournament.name);
    }

    tournament.status = newStatus;
    const saved = await tournament.save();

    if (newStatus === TournamentStatus.CANCELLED) {
      await this.auditLogsService.log({
        actorId,
        action: 'tournament.cancel',
        entityType: 'Tournament',
        entityId: id,
        before: { status: tournament.status },
        after: { status: newStatus },
      });
    }

    return saved;
  }

  private async cascadeCancel(
    tournamentId: string,
    tournamentName: string,
  ): Promise<void> {
    // Get all race IDs before cancelling
    const races = await this.raceModel.find({
      tournamentId,
      status: { $nin: [RaceStatus.RESULT_PUBLISHED, RaceStatus.CANCELLED] },
    });
    const raceIds = races.map((r) => r._id);

    if (raceIds.length > 0) {
      const pendingPredictions = await this.predictionModel.find({
        raceId: { $in: raceIds },
        status: PredictionStatus.PENDING,
      });

      for (const p of pendingPredictions) {
        if (p.betPoints && p.betPoints >= 2) {
          await this.ledgerService.credit({
            userId: String(p.userId),
            points: p.betPoints,
            sourceType: LedgerSourceType.PREDICTION_REWARD,
            sourceId: String(p._id),
            note: `Hoàn trả cược dự đoán (+${p.betPoints} điểm) do giải đấu bị hủy`,
          });

          await this.notificationsService.send(
            String(p.userId),
            'Dự đoán bị hủy',
            `Giải đấu bị hủy, bạn được hoàn trả ${p.betPoints} điểm cược dự đoán.`,
            NotificationType.PREDICTION,
          );
        }
      }
    }

    await Promise.all([
      // Cancel exactly the races captured in raceIds (consistent scope with find above)
      raceIds.length > 0
        ? this.raceModel.updateMany(
            { _id: { $in: raceIds } },
            { $set: { status: RaceStatus.CANCELLED } },
          )
        : Promise.resolve(),
      // Cancel pending predictions for cancelled races
      raceIds.length > 0
        ? this.predictionModel.updateMany(
            { raceId: { $in: raceIds }, status: PredictionStatus.PENDING },
            { $set: { status: PredictionStatus.CANCELLED } },
          )
        : Promise.resolve(),
    ]);

    // PENDING → CANCELLED; APPROVED → WITHDRAWN
    // REJECTED registrations are intentionally skipped — rejection is terminal.
    if (raceIds.length > 0) {
      await this.registrationModel.updateMany(
        { raceId: { $in: raceIds }, status: RegistrationStatus.PENDING },
        { $set: { status: RegistrationStatus.CANCELLED } },
      );
      await this.registrationModel.updateMany(
        { raceId: { $in: raceIds }, status: RegistrationStatus.APPROVED },
        { $set: { status: RegistrationStatus.WITHDRAWN } },
      );
    }

    // Notify all affected owners
    const ownerIds = await this.registrationModel.distinct('ownerId', {
      tournamentId,
    });
    if (ownerIds.length > 0) {
      await Promise.all(
        ownerIds.map((ownerId) =>
          this.notificationsService.send(
            String(ownerId),
            'Tournament Cancelled',
            `Tournament "${tournamentName}" has been cancelled. Your registrations have been cancelled.`,
            NotificationType.RACE,
          ),
        ),
      );
    }
  }

  async softDelete(id: string): Promise<void> {
    const tournament = await this.findOne(id);
    if (
      tournament.status === TournamentStatus.ONGOING ||
      tournament.status === TournamentStatus.COMPLETED
    ) {
      throw new BadRequestException(
        'Cannot delete an ongoing or completed tournament',
      );
    }
    tournament.deletedAt = new Date();
    await tournament.save();
  }
}
