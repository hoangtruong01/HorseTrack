import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import {
  Registration,
  RegistrationSchema,
} from '../registrations/schemas/registration.schema';
import {
  JockeyInvitation,
  JockeyInvitationSchema,
} from './schemas/jockey-invitation.schema';
import { JockeyInvitationsController } from './jockey-invitations.controller';
import { JockeyInvitationsService } from './jockey-invitations.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JockeyInvitation.name, schema: JockeyInvitationSchema },
      { name: Registration.name, schema: RegistrationSchema },
    ]),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [JockeyInvitationsController],
  providers: [JockeyInvitationsService],
  exports: [JockeyInvitationsService],
})
export class JockeyInvitationsModule {}
