import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { HorsesService } from '../horses/horses.service';
import { TournamentsService } from '../tournaments/tournaments.service';
import { HorseHealthStatus, HorseStatus } from '../horses/schemas/horse.schema';
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
    private notificationsService: NotificationsService,
  ) {}

  async create(
    dto: CreateRegistrationDto,
    ownerId: string,
  ): Promise<RegistrationDocument> {
    // 1. Tournament must be OPEN_REGISTRATION
    const tournament = await this.tournamentsService.findOne(dto.tournamentId);
    if (tournament.status !== TournamentStatus.OPEN_REGISTRATION) {
      throw new BadRequestException(
        'Tournament is not open for registration',
      );
    }

    // 2. Horse must belong to owner
    const horse = await this.horsesService.findOne(dto.horseId);
    if (String(horse.ownerId) !== ownerId) {
      throw new ForbiddenException('You can only register your own horses');
    }

    // 3. Horse must be HEALTHY and ACTIVE
    if (horse.healthStatus !== HorseHealthStatus.HEALTHY) {
      throw new BadRequestException('Horse must be HEALTHY to register');
    }
    if (horse.status !== HorseStatus.ACTIVE) {
      throw new BadRequestException('Horse must be ACTIVE to register');
    }

    // 4. No duplicate registration
    const existing = await this.registrationModel.findOne({
      tournamentId: dto.tournamentId,
      horseId: dto.horseId,
      status: { $ne: RegistrationStatus.CANCELLED },
    });
    if (existing) {
      throw new ConflictException(
        'This horse is already registered for this tournament',
      );
    }

    return this.registrationModel.create({
      ...dto,
      ownerId,
      registeredAt: new Date(),
    });
  }

  async findAll(page = 1, limit = 20, tournamentId?: string) {
    const filter: Record<string, unknown> = {};
    if (tournamentId) filter.tournamentId = tournamentId;

    const [data, total] = await Promise.all([
      this.registrationModel
        .find(filter)
        .populate('tournamentId', 'name status')
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
      throw new BadRequestException('Only PENDING registrations can be approved');
    }
    reg.status = RegistrationStatus.APPROVED;
    reg.approvedAt = new Date();
    reg.approvedBy = adminId as any;
    const saved = await reg.save();

    // Notify the owner!
    await this.notificationsService.send(
      String(reg.ownerId._id ?? reg.ownerId),
      'Registration Approved',
      `Your registration for horse "${(reg.horseId as any).name}" has been approved!`,
      NotificationType.REGISTRATION,
    );

    return saved;
  }

  async reject(
    id: string,
    reason?: string,
  ): Promise<RegistrationDocument> {
    const reg = await this.findOne(id);
    if (reg.status !== RegistrationStatus.PENDING) {
      throw new BadRequestException('Only PENDING registrations can be rejected');
    }
    reg.status = RegistrationStatus.REJECTED;
    reg.rejectReason = reason;
    const saved = await reg.save();

    // Notify the owner!
    await this.notificationsService.send(
      String(reg.ownerId._id ?? reg.ownerId),
      'Registration Rejected',
      `Your registration for horse "${(reg.horseId as any).name}" has been rejected. Reason: ${reason ?? 'None specified'}`,
      NotificationType.REGISTRATION,
    );

    return saved;
  }

  async cancel(id: string, ownerId: string): Promise<RegistrationDocument> {
    const reg = await this.findOne(id);
    if (String(reg.ownerId._id ?? reg.ownerId) !== ownerId) {
      throw new ForbiddenException('You can only cancel your own registrations');
    }
    if (reg.status === RegistrationStatus.APPROVED) {
      throw new BadRequestException('Cannot cancel an approved registration');
    }
    reg.status = RegistrationStatus.CANCELLED;
    const saved = await reg.save();

    return saved;
  }
}
