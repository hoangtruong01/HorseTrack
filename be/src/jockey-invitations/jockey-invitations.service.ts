import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Registration,
  RegistrationDocument,
} from '../registrations/schemas/registration.schema';
import { UsersService } from '../users/users.service';
import { RoleName } from '../users/schemas/user.schema';
import {
  Jockey,
  JockeyDocument,
  JockeyStatus,
} from '../jockeys/schemas/jockey.schema';
import { Race, RaceDocument, RaceStatus } from '../races/schemas/race.schema';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import {
  InvitationStatus,
  JockeyInvitation,
  JockeyInvitationDocument,
} from './schemas/jockey-invitation.schema';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

const INVITATION_EXPIRY_DAYS = 3;
const CONFLICT_WINDOW_MS = 4 * 60 * 60 * 1000; // 4 hours

/** Race statuses where jockey assignment is locked */
const LOCKED_RACE_STATUSES = [
  RaceStatus.READY,
  RaceStatus.LIVE,
  RaceStatus.FINISHED,
  RaceStatus.RESULT_PUBLISHED,
];

@Injectable()
export class JockeyInvitationsService {
  constructor(
    @InjectModel(JockeyInvitation.name)
    private invitationModel: Model<JockeyInvitationDocument>,
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
    @InjectModel(Jockey.name)
    private jockeyModel: Model<JockeyDocument>,
    @InjectModel(Race.name)
    private raceModel: Model<RaceDocument>,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  async create(
    dto: CreateInvitationDto,
    ownerId: string,
  ): Promise<JockeyInvitationDocument> {
    // 1. Verify registration exists and belongs to the owner
    const registration = await this.registrationModel
      .findById(dto.registrationId)
      .exec();
    if (!registration) throw new NotFoundException('Registration not found');
    if (String(registration.ownerId) !== ownerId) {
      throw new ForbiddenException(
        'You can only invite a jockey for your own registered horse',
      );
    }

    // 2. Check registration doesn't already have a jockey assigned
    if (registration.jockeyUserId) {
      throw new BadRequestException(
        'This registration already has a jockey assigned. Cancel or remove the current jockey first.',
      );
    }

    // 3. Verify race is not locked for jockey changes
    const race = await this.raceModel.findById(registration.raceId);
    if (!race) throw new NotFoundException('Race not found');
    if (LOCKED_RACE_STATUSES.includes(race.status)) {
      throw new BadRequestException(
        `Cannot invite a jockey when race is in ${race.status} status`,
      );
    }

    // 4. Verify target user has JOCKEY role
    const jockeyUser = await this.usersService.findById(dto.jockeyId);
    if (!jockeyUser.roles.includes(RoleName.JOCKEY)) {
      throw new BadRequestException('Target user does not have JOCKEY role');
    }

    // 5. Verify jockey profile exists and is AVAILABLE
    const jockeyProfile = await this.jockeyModel.findOne({
      userId: new Types.ObjectId(dto.jockeyId),
    });
    if (!jockeyProfile) {
      throw new BadRequestException('Jockey profile not found');
    }
    if (jockeyProfile.status !== JockeyStatus.AVAILABLE) {
      throw new BadRequestException(
        `Jockey is ${jockeyProfile.status} and cannot accept race invitations`,
      );
    }

    // 6. Prevent duplicate active invitation
    const existing = await this.invitationModel.findOne({
      registrationId: new Types.ObjectId(dto.registrationId),
      jockeyUserId: new Types.ObjectId(dto.jockeyId),
      status: InvitationStatus.PENDING,
    });
    if (existing) {
      throw new BadRequestException(
        'A pending invitation already exists for this jockey and registration',
      );
    }

    // 7. Validate jockeySharePercent
    const sharePercent = dto.jockeySharePercent ?? 30;
    if (sharePercent < 5 || sharePercent > 50) {
      throw new BadRequestException(
        'Jockey share percent must be between 5% and 50%',
      );
    }

    const expiredAt = new Date();
    expiredAt.setDate(expiredAt.getDate() + INVITATION_EXPIRY_DAYS);

    const invitation = await this.invitationModel.create({
      registrationId: new Types.ObjectId(dto.registrationId),
      tournamentId: registration.tournamentId,
      raceId: registration.raceId,
      horseId: registration.horseId,
      ownerId: new Types.ObjectId(ownerId),
      jockeyUserId: new Types.ObjectId(dto.jockeyId),
      message: dto.message,
      jockeySharePercent: sharePercent,
      expiredAt,
    });

    await this.notificationsService.send(
      dto.jockeyId,
      'New Race Invitation',
      `You have been invited to ride in a race with ${sharePercent}% prize share. Message: ${dto.message ?? ''}`,
      NotificationType.RACE,
    );

    return invitation;
  }

  async respond(
    id: string,
    status: InvitationStatus,
    jockeyUserId: string,
  ): Promise<JockeyInvitationDocument> {
    const invitation = await this.invitationModel.findById(id);
    if (!invitation) throw new NotFoundException('Invitation not found');

    if (String(invitation.jockeyUserId) !== jockeyUserId) {
      throw new ForbiddenException(
        'You can only respond to invitations sent to you',
      );
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Invitation has already been responded to');
    }

    // Check if expired
    if (invitation.expiredAt && new Date() > invitation.expiredAt) {
      invitation.status = InvitationStatus.EXPIRED;
      await invitation.save();
      throw new BadRequestException('Invitation has expired');
    }

    // When accepting, run additional checks
    if (status === InvitationStatus.ACCEPTED) {
      // Check registration doesn't already have a jockey
      const registration = await this.registrationModel.findById(
        invitation.registrationId,
      );
      if (registration?.jockeyUserId) {
        throw new BadRequestException(
          'This registration already has a jockey assigned',
        );
      }

      // Check race is not locked (READY or beyond)
      const race = await this.raceModel.findById(invitation.raceId);
      if (race && LOCKED_RACE_STATUSES.includes(race.status)) {
        throw new BadRequestException(
          `Cannot accept invitation — race is already in ${race.status} status`,
        );
      }

      // Check schedule conflict: jockey already accepted another race within 4-hour window
      if (race) {
        const acceptedInvitations = await this.invitationModel.find({
          jockeyUserId: new Types.ObjectId(jockeyUserId),
          status: InvitationStatus.ACCEPTED,
          _id: { $ne: id },
        });

        if (acceptedInvitations.length > 0) {
          const conflictRaceIds = acceptedInvitations.map((inv) => inv.raceId);
          const windowStart = new Date(
            race.startTime.getTime() - CONFLICT_WINDOW_MS,
          );
          const windowEnd = new Date(
            race.startTime.getTime() + CONFLICT_WINDOW_MS,
          );
          const conflicting = await this.raceModel.findOne({
            _id: { $in: conflictRaceIds },
            startTime: { $gte: windowStart, $lte: windowEnd },
            status: {
              $nin: [RaceStatus.CANCELLED, RaceStatus.RESULT_PUBLISHED],
            },
          });

          if (conflicting) {
            throw new BadRequestException(
              'You already have an accepted race within the same time window (4-hour conflict)',
            );
          }
        }
      }

      // Bind jockey to registration + save jockeySharePercent
      await this.registrationModel.findByIdAndUpdate(
        invitation.registrationId,
        {
          jockeyUserId: invitation.jockeyUserId,
          jockeySharePercent: invitation.jockeySharePercent,
        },
      );

      // Auto-cancel all other PENDING invitations for the same registration
      await this.invitationModel.updateMany(
        {
          registrationId: invitation.registrationId,
          _id: { $ne: invitation._id },
          status: InvitationStatus.PENDING,
        },
        {
          status: InvitationStatus.CANCELLED,
        },
      );
    }

    invitation.status = status;
    invitation.respondedAt = new Date();
    await invitation.save();

    const jockeyUser = await this.usersService.findById(jockeyUserId);
    await this.notificationsService.send(
      String(invitation.ownerId),
      `Invitation ${status.toLowerCase()}`,
      `Jockey ${jockeyUser.fullName} has ${status.toLowerCase()} your race invitation.`,
      NotificationType.RACE,
    );

    return invitation;
  }

  async cancel(id: string, ownerId: string): Promise<JockeyInvitationDocument> {
    const invitation = await this.invitationModel.findById(id);
    if (!invitation) throw new NotFoundException('Invitation not found');
    if (String(invitation.ownerId) !== ownerId) {
      throw new ForbiddenException('You can only cancel your own invitations');
    }
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException(
        'Only pending invitations can be cancelled',
      );
    }
    invitation.status = InvitationStatus.CANCELLED;
    return invitation.save();
  }

  async findMyReceived(jockeyUserId: string, page = 1, limit = 20) {
    const filter = { jockeyUserId: new Types.ObjectId(jockeyUserId) };
    const [data, total] = await Promise.all([
      this.invitationModel
        .find(filter)
        .populate('registrationId')
        .populate('tournamentId', 'name startDate endDate location status')
        .populate('raceId', 'name startTime status distanceMeters lapCount location prize')
        .populate('horseId', 'name breed age gender color weightKg heightCm baseSpeed staminaScore image healthStatus')
        .populate('ownerId', 'fullName email phone avatar')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.invitationModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findMySent(ownerUserId: string, page = 1, limit = 20) {
    const filter = { ownerId: new Types.ObjectId(ownerUserId) };
    const [data, total] = await Promise.all([
      this.invitationModel
        .find(filter)
        .populate('registrationId')
        .populate('tournamentId', 'name startDate endDate location status')
        .populate('raceId', 'name startTime status distanceMeters')
        .populate('horseId', 'name breed')
        .populate('jockeyUserId', 'fullName email phone avatar')
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.invitationModel.countDocuments(filter),
    ]);
    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }
}
