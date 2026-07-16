import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { HorsesService } from '../horses/horses.service';
import { TournamentsService } from '../tournaments/tournaments.service';
import { RacesService } from '../races/races.service';
import { RaceStatus } from '../races/schemas/race.schema';
import {
  HorseDocument,
  HorseHealthStatus,
  HorseStatus,
  HorseApprovalStatus,
} from '../horses/schemas/horse.schema';
import { TournamentStatus } from '../tournaments/schemas/tournament.schema';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import {
  Registration,
  RegistrationDocument,
  RegistrationStatus,
} from './schemas/registration.schema';
import {
  RaceResult,
  RaceResultDocument,
  RaceResultStatus,
} from '../race-results/schemas/race-result.schema';

import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { PredictionsService } from '../predictions/predictions.service';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
    @InjectModel(RaceResult.name)
    private raceResultModel: Model<RaceResultDocument>,
    private horsesService: HorsesService,
    private tournamentsService: TournamentsService,
    private racesService: RacesService,
    private notificationsService: NotificationsService,
    private auditLogsService: AuditLogsService,
    private predictionsService: PredictionsService,
  ) {}

  async create(
    dto: CreateRegistrationDto,
    ownerId: string,
  ): Promise<RegistrationDocument> {
    // 0. Fetch the race
    const race = await this.racesService.findOne(dto.raceId);
    const tournamentId =
      dto.tournamentId || String(race.tournamentId._id || race.tournamentId);

    // 1. Tournament must be OPEN_REGISTRATION
    const tournament = await this.tournamentsService.findOne(tournamentId);
    if (tournament.status !== TournamentStatus.OPEN_REGISTRATION) {
      throw new BadRequestException('Tournament is not open for registration');
    }

    // 2. Validate registration window dates & race status
    if (race.status !== RaceStatus.SCHEDULED) {
      throw new BadRequestException(
        'Chỉ có thể đăng ký tham gia trận đua đang lên lịch (SCHEDULED)',
      );
    }

    // 3. Horse must belong to owner — use raw (unpopulated) document so that
    //    String(horse.ownerId) reliably returns the hex ObjectId string.
    const horse = await this.horsesService.findRaw(dto.horseId);
    if (String(horse.ownerId) !== ownerId) {
      throw new ForbiddenException('You can only register your own horses');
    }

    // 4. Horse must be HEALTHY, ACTIVE and APPROVED
    if (horse.healthStatus !== HorseHealthStatus.HEALTHY) {
      throw new BadRequestException('Horse must be HEALTHY to register');
    }
    if (horse.status !== HorseStatus.ACTIVE) {
      throw new BadRequestException('Horse must be ACTIVE to register');
    }
    if (horse.approvalStatus !== HorseApprovalStatus.APPROVED) {
      throw new BadRequestException(
        'Horse must be APPROVED by admin to register',
      );
    }

    // 4b. Horse weight must fall within the race weight class (if any)
    if (race.minWeightKg != null || race.maxWeightKg != null) {
      if (horse.weightKg == null) {
        throw new BadRequestException(
          'Ngựa cần có cân nặng để đăng ký race có giới hạn hạng cân',
        );
      }
      const range = `${race.minWeightKg ?? '—'}–${race.maxWeightKg ?? '—'} kg`;
      if (race.minWeightKg != null && horse.weightKg < race.minWeightKg) {
        throw new BadRequestException(
          `Cân nặng ngựa (${horse.weightKg} kg) không nằm trong khoảng cho phép của race (${range})`,
        );
      }
      if (race.maxWeightKg != null && horse.weightKg > race.maxWeightKg) {
        throw new BadRequestException(
          `Cân nặng ngựa (${horse.weightKg} kg) không nằm trong khoảng cho phép của race (${range})`,
        );
      }
    }

    // Mongoose 9 does not auto-cast string hex ids to ObjectId in filters here,
    // so guard queries must cast explicitly (same convention as the insert below).
    const raceObjectId = new Types.ObjectId(dto.raceId);
    const ownerObjectId = new Types.ObjectId(ownerId);

    // 5. No duplicate registration for the same race
    const existing = await this.registrationModel.findOne({
      raceId: raceObjectId,
      horseId: new Types.ObjectId(dto.horseId),
      status: { $ne: RegistrationStatus.CANCELLED },
    });
    if (existing) {
      throw new ConflictException(
        'This horse is already registered for this race',
      );
    }

    // 5b. An owner may only have one horse registered per race
    const ownerExisting = await this.registrationModel.findOne({
      raceId: raceObjectId,
      ownerId: ownerObjectId,
      status: {
        $in: [RegistrationStatus.PENDING, RegistrationStatus.APPROVED],
      },
    });
    if (ownerExisting) {
      throw new ConflictException(
        'You already have a horse registered for this race',
      );
    }

    // 6a. Per-race slot check: pending + approved for this race
    const raceSlot = race.maxParticipants ?? 20;
    const perRaceCount = await this.registrationModel.countDocuments({
      raceId: raceObjectId,
      status: {
        $in: [RegistrationStatus.PENDING, RegistrationStatus.APPROVED],
      },
    });
    if (perRaceCount >= raceSlot) {
      throw new BadRequestException(
        `Race slot is full (max ${raceSlot} horses per race)`,
      );
    }

    // 6b. Tournament-wide slot check: total entries across all races in this tournament
    if (tournament.maxHorses) {
      const totalCount = await this.registrationModel.countDocuments({
        tournamentId: new Types.ObjectId(tournamentId),
        status: {
          $in: [RegistrationStatus.PENDING, RegistrationStatus.APPROVED],
        },
      });
      if (totalCount >= tournament.maxHorses) {
        throw new BadRequestException(
          `Tournament is full (max ${tournament.maxHorses} total horse entries)`,
        );
      }
    }

    return this.registrationModel.create({
      ...dto,
      raceId: new Types.ObjectId(dto.raceId),
      horseId: new Types.ObjectId(dto.horseId),
      tournamentId: new Types.ObjectId(tournamentId),
      ownerId: new Types.ObjectId(ownerId),
    });
  }

  async findAll(
    page = 1,
    limit = 20,
    tournamentId?: string,
    raceId?: string,
    status?: string,
  ) {
    const filter: Record<string, unknown> = {};
    if (tournamentId && Types.ObjectId.isValid(tournamentId)) {
      filter.tournamentId = new Types.ObjectId(tournamentId);
    }
    if (raceId && Types.ObjectId.isValid(raceId)) {
      filter.raceId = new Types.ObjectId(raceId);
    }
    if (status) filter.status = status;

    const [data, total] = await Promise.all([
      this.registrationModel
        .find(filter)
        .populate('tournamentId', 'name status')
        .populate('raceId', 'name startTime status')
        .populate('horseId', 'name breed')
        .populate('ownerId', 'fullName email')
        .populate('jockeyUserId', 'fullName email')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.registrationModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findMyRegistrations(ownerId: string, page = 1, limit = 20) {
    const filter = { ownerId: new Types.ObjectId(ownerId) };
    const [data, total] = await Promise.all([
      this.registrationModel
        .find(filter)
        .populate('tournamentId', 'name status')
        .populate('raceId', 'name startTime status')
        .populate('horseId', 'name breed')
        .populate('jockeyUserId', 'fullName email')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.registrationModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string): Promise<RegistrationDocument> {
    const reg = await this.registrationModel
      .findById(id)
      .populate('tournamentId', 'name status')
      .populate('raceId', 'name startTime status')
      .populate('horseId', 'name breed')
      .populate('ownerId', 'fullName email')
      .populate('jockeyUserId', 'fullName email')
      .exec();
    if (!reg) throw new NotFoundException('Registration not found');
    return reg;
  }

  async approve(id: string, adminId: string): Promise<RegistrationDocument> {
    const reg = await this.findOne(id);
    if (reg.status !== RegistrationStatus.PENDING) {
      throw new BadRequestException(
        'Only PENDING registrations can be approved',
      );
    }

    // Check per-race approved count (hard limit — tournament.maxHorses is total across races,
    // not a per-race constraint, so only race.maxHorses applies here)
    const raceIdStr = String(
      (reg.raceId as unknown as { _id: string })?._id ?? reg.raceId,
    );
    const race = await this.racesService.findOne(raceIdStr);
    const raceSlot = race.maxParticipants ?? 20;
    const approvedCount = await this.registrationModel.countDocuments({
      raceId: reg.raceId,
      status: RegistrationStatus.APPROVED,
    });
    if (approvedCount >= raceSlot) {
      throw new BadRequestException(
        `Race slot is full (max ${raceSlot} approved horses per race)`,
      );
    }

    reg.status = RegistrationStatus.APPROVED;
    reg.approvedAt = new Date();
    reg.approvedBy = adminId as unknown as Types.ObjectId;
    const saved = await reg.save();

    await this.auditLogsService.log({
      actorId: adminId,
      action: 'registration.approve',
      entityType: 'Registration',
      entityId: id,
      after: { status: RegistrationStatus.APPROVED },
    });

    // Notify the owner!
    const horse = reg.horseId as unknown as HorseDocument;
    const owner = reg.ownerId as unknown as { _id?: string };
    await this.notificationsService.send(
      String(owner._id ?? reg.ownerId),
      'Registration Approved',
      `Your registration for horse "${horse.name}" has been approved!`,
      NotificationType.RACE,
    );

    return saved;
  }

  async reject(id: string, reason?: string): Promise<RegistrationDocument> {
    const reg = await this.findOne(id);
    if (reg.status !== RegistrationStatus.PENDING) {
      throw new BadRequestException(
        'Only PENDING registrations can be rejected',
      );
    }
    reg.status = RegistrationStatus.REJECTED;
    reg.rejectedReason = reason;
    const saved = await reg.save();

    // Notify the owner!
    const horse = reg.horseId as unknown as HorseDocument;
    const owner = reg.ownerId as unknown as { _id?: string };
    await this.notificationsService.send(
      String(owner._id ?? reg.ownerId),
      'Registration Rejected',
      `Your registration for horse "${horse.name}" has been rejected. Reason: ${reason ?? 'None specified'}`,
      NotificationType.RACE,
    );

    return saved;
  }

  async cancel(id: string, ownerId: string): Promise<RegistrationDocument> {
    const reg = await this.findOne(id);
    if (String(reg.ownerId._id ?? reg.ownerId) !== ownerId) {
      throw new ForbiddenException(
        'You can only cancel your own registrations',
      );
    }
    if (reg.status === RegistrationStatus.APPROVED) {
      throw new BadRequestException('Cannot cancel an approved registration');
    }
    reg.status = RegistrationStatus.CANCELLED;
    return reg.save();
  }

  /** Owner withdraws an APPROVED registration (different semantic from cancel) */
  async withdraw(id: string, ownerId: string): Promise<RegistrationDocument> {
    const reg = await this.findOne(id);
    if (String(reg.ownerId._id ?? reg.ownerId) !== ownerId) {
      throw new ForbiddenException(
        'You can only withdraw your own registrations',
      );
    }
    if (reg.status !== RegistrationStatus.APPROVED) {
      throw new BadRequestException(
        'Only APPROVED registrations can be withdrawn',
      );
    }
    reg.status = RegistrationStatus.WITHDRAWN;
    const saved = await reg.save();
    try {
      const raceId = String(
        (reg.raceId as unknown as { _id?: string })._id ?? reg.raceId,
      );
      const horseId = String(
        (reg.horseId as unknown as { _id?: string })._id ?? reg.horseId,
      );
      await this.predictionsService.cancelPredictionsForHorseInRace(
        raceId,
        horseId,
      );
    } catch (err) {
      console.error(
        'Failed to cancel predictions after registration withdrawn:',
        err,
      );
    }
    try {
      await this.raceResultModel.deleteMany({
        raceRegistrationId: reg._id,
        status: RaceResultStatus.DRAFT,
      });
    } catch (err) {
      console.error(
        'Failed to clean up draft race results after registration withdrawn:',
        err,
      );
    }
    return saved;
  }
}
