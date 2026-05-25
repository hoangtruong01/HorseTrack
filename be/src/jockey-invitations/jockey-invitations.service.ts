import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Registration,
  RegistrationDocument,
} from '../registrations/schemas/registration.schema';
import { UsersService } from '../users/users.service';
import { RoleName } from '../users/schemas/user.schema';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import {
  InvitationStatus,
  JockeyInvitation,
  JockeyInvitationDocument,
} from './schemas/jockey-invitation.schema';

import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/schemas/notification.schema';

@Injectable()
export class JockeyInvitationsService {
  constructor(
    @InjectModel(JockeyInvitation.name)
    private invitationModel: Model<JockeyInvitationDocument>,
    @InjectModel(Registration.name)
    private registrationModel: Model<RegistrationDocument>,
    private usersService: UsersService,
    private notificationsService: NotificationsService,
  ) {}

  async create(
    dto: CreateInvitationDto,
    ownerId: string,
  ): Promise<JockeyInvitationDocument> {
    // 1. Verify registration exists and belongs to the owner
    const registration = await this.registrationModel.findById(
      dto.registrationId,
    );
    if (!registration) {
      throw new NotFoundException('Registration not found');
    }
    if (String(registration.ownerId) !== ownerId) {
      throw new ForbiddenException(
        'You can only invite a jockey for your own registered horse',
      );
    }

    // 2. Verify target jockey exists and has JOCKEY role
    const jockeyUser = await this.usersService.findById(dto.jockeyId);
    if (!jockeyUser.roles.includes(RoleName.JOCKEY)) {
      throw new BadRequestException('Target user does not have JOCKEY role');
    }

    // 3. Prevent duplicate active invitation
    const existing = await this.invitationModel.findOne({
      registrationId: dto.registrationId,
      jockeyId: dto.jockeyId,
      status: InvitationStatus.PENDING,
    });
    if (existing) {
      throw new BadRequestException(
        'A pending invitation already exists for this jockey and registration',
      );
    }

    const invitation = await this.invitationModel.create({
      ...dto,
      ownerId,
    });

    // Notify the jockey!
    await this.notificationsService.send(
      dto.jockeyId,
      'New Race Invitation',
      `You have been invited by an owner to ride in a race registration. Message: ${dto.message ?? ''}`,
      NotificationType.INVITATION,
    );

    return invitation;
  }

  async respond(
    id: string,
    status: InvitationStatus,
    jockeyUserId: string,
  ): Promise<JockeyInvitationDocument> {
    const invitation = await this.invitationModel.findById(id);
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    // Verify jockey owns the invitation
    if (String(invitation.jockeyId) !== jockeyUserId) {
      throw new ForbiddenException(
        'You can only respond to invitations sent to you',
      );
    }

    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException('Invitation has already been responded to');
    }

    invitation.status = status;
    await invitation.save();

    // Notify the owner of the response!
    const jockeyUser = await this.usersService.findById(jockeyUserId);
    await this.notificationsService.send(
      String(invitation.ownerId),
      `Invitation ${status.toLowerCase()}`,
      `Jockey ${jockeyUser.fullName} has ${status.toLowerCase()} your race invitation.`,
      NotificationType.INVITATION,
    );

    // If accepted, bind jockey to registration officially!
    if (status === InvitationStatus.ACCEPTED) {
      await this.registrationModel.findByIdAndUpdate(
        invitation.registrationId,
        {
          jockeyId: invitation.jockeyId,
        },
      );
    }

    return invitation;
  }

  async findMyReceived(jockeyUserId: string, page = 1, limit = 20) {
    const filter = { jockeyId: jockeyUserId };
    const [data, total] = await Promise.all([
      this.invitationModel
        .find(filter)
        .populate('registrationId')
        .populate('ownerId', 'fullName email phone')
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
    const filter = { ownerId: ownerUserId };
    const [data, total] = await Promise.all([
      this.invitationModel
        .find(filter)
        .populate('registrationId')
        .populate('jockeyId', 'fullName email phone')
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
