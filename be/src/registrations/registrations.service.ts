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
import {
  HorseDocument,
  HorseHealthStatus,
  HorseStatus,
} from '../horses/schemas/horse.schema';
import { TournamentStatus } from '../tournaments/schemas/tournament.schema';
import { CreateRegistrationDto } from './dto/create-registration.dto';
import {
  Registration,
  RegistrationDocument,
  RegistrationStatus,
} from './schemas/registration.schema';

import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

@Injectable()
export class RegistrationsService {
  constructor(
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
    private horsesService: HorsesService,
    private tournamentsService: TournamentsService,
    private racesService: RacesService,
    private notificationsService: NotificationsService,
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

    // 2. Validate registration window dates
    const now = new Date();
    if (
      tournament.registrationStartDate &&
      now < tournament.registrationStartDate
    ) {
      throw new BadRequestException('Registration window has not opened yet');
    }
    if (
      tournament.registrationEndDate &&
      now > tournament.registrationEndDate
    ) {
      throw new BadRequestException('Registration window has closed');
    }

    // 3. Horse must belong to owner
    const horse = await this.horsesService.findOne(dto.horseId);
    if (String(horse.ownerId) !== ownerId) {
      throw new ForbiddenException('You can only register your own horses');
    }

    // 4. Horse must be HEALTHY and ACTIVE
    if (horse.healthStatus !== HorseHealthStatus.HEALTHY) {
      throw new BadRequestException('Horse must be HEALTHY to register');
    }
    if (horse.status !== HorseStatus.ACTIVE) {
      throw new BadRequestException('Horse must be ACTIVE to register');
    }

    // 5. No duplicate registration for the same race
    const existing = await this.registrationModel.findOne({
      raceId: dto.raceId,
      horseId: dto.horseId,
      status: { $ne: RegistrationStatus.CANCELLED },
    });
    if (existing) {
      throw new ConflictException(
        'This horse is already registered for this race',
      );
    }

    // 6a. Per-race slot check: pending + approved for this race
    const raceSlot = race.maxHorses ?? 20;
    const perRaceCount = await this.registrationModel.countDocuments({
      raceId: dto.raceId,
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
        tournamentId,
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
      tournamentId,
      ownerId,
      registeredAt: new Date(),
    });
  }

  async findAll(page = 1, limit = 20, tournamentId?: string, raceId?: string) {
    const filter: Record<string, unknown> = {};
    if (tournamentId) filter.tournamentId = tournamentId;
    if (raceId) filter.raceId = raceId;

    const [data, total] = await Promise.all([
      this.registrationModel
        .find(filter)
        .populate('tournamentId', 'name status')
        .populate('raceId', 'name scheduledAt status')
        .populate('horseId', 'name breed')
        .populate('ownerId', 'fullName email')
        .populate('jockeyId', 'fullName email')
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
    const filter = { ownerId };
    const [data, total] = await Promise.all([
      this.registrationModel
        .find(filter)
        .populate('tournamentId', 'name status')
        .populate('raceId', 'name scheduledAt status')
        .populate('horseId', 'name breed')
        .populate('jockeyId', 'fullName email')
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
      .populate('raceId', 'name scheduledAt status')
      .populate('horseId', 'name breed')
      .populate('ownerId', 'fullName email')
      .populate('jockeyId', 'fullName email')
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
    const raceSlot = race.maxHorses ?? 20;
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

    // Notify the owner!
    const horse = reg.horseId as unknown as HorseDocument;
    const owner = reg.ownerId as unknown as { _id?: string };
    await this.notificationsService.send(
      String(owner._id ?? reg.ownerId),
      'Registration Approved',
      `Your registration for horse "${horse.name}" has been approved!`,
      NotificationType.REGISTRATION,
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
    reg.rejectReason = reason;
    const saved = await reg.save();

    // Notify the owner!
    const horse = reg.horseId as unknown as HorseDocument;
    const owner = reg.ownerId as unknown as { _id?: string };
    await this.notificationsService.send(
      String(owner._id ?? reg.ownerId),
      'Registration Rejected',
      `Your registration for horse "${horse.name}" has been rejected. Reason: ${reason ?? 'None specified'}`,
      NotificationType.REGISTRATION,
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
    const saved = await reg.save();

    return saved;
  }
}
