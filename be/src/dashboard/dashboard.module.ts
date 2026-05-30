import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Horse, HorseSchema } from '../horses/schemas/horse.schema';
import {
  Tournament,
  TournamentSchema,
} from '../tournaments/schemas/tournament.schema';
import { Race, RaceSchema } from '../races/schemas/race.schema';
import {
  Registration,
  RegistrationSchema,
} from '../registrations/schemas/registration.schema';
import { Prize, PrizeSchema } from '../prizes/schemas/prize.schema';
import {
  Prediction,
  PredictionSchema,
} from '../predictions/schemas/prediction.schema';
import {
  RaceResult,
  RaceResultSchema,
} from '../race-results/schemas/race-result.schema';
import {
  JockeyInvitation,
  JockeyInvitationSchema,
} from '../jockey-invitations/schemas/jockey-invitation.schema';
import {
  RefereeAssignment,
  RefereeAssignmentSchema,
} from '../referee-assignments/schemas/referee-assignment.schema';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Horse.name, schema: HorseSchema },
      { name: Tournament.name, schema: TournamentSchema },
      { name: Race.name, schema: RaceSchema },
      { name: Registration.name, schema: RegistrationSchema },
      { name: Prize.name, schema: PrizeSchema },
      { name: Prediction.name, schema: PredictionSchema },
      { name: RaceResult.name, schema: RaceResultSchema },
      { name: JockeyInvitation.name, schema: JockeyInvitationSchema },
      { name: RefereeAssignment.name, schema: RefereeAssignmentSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
