import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { NotificationsModule } from '../notifications/notifications.module';
import {
  Registration,
  RegistrationSchema,
} from '../registrations/schemas/registration.schema';
import { Jockey, JockeySchema } from '../jockeys/schemas/jockey.schema';
import { Race, RaceSchema } from '../races/schemas/race.schema';
import {
  Tournament,
  TournamentSchema,
} from '../tournaments/schemas/tournament.schema';
import {
  JockeyInvitation,
  JockeyInvitationSchema,
} from './schemas/jockey-invitation.schema';
import { JockeyInvitationsController } from './jockey-invitations.controller';
import { JockeyInvitationsService } from './jockey-invitations.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: JockeyInvitation.name, schema: JockeyInvitationSchema },
      { name: Registration.name, schema: RegistrationSchema },
      { name: Jockey.name, schema: JockeySchema },
      { name: Race.name, schema: RaceSchema },
      { name: Tournament.name, schema: TournamentSchema },
    ]),
    UsersModule,
    NotificationsModule,
  ],
  controllers: [JockeyInvitationsController],
  providers: [JockeyInvitationsService],
  exports: [JockeyInvitationsService],
})
export class JockeyInvitationsModule {}
