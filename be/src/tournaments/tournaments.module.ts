import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Tournament, TournamentSchema } from './schemas/tournament.schema';
import { Race, RaceSchema } from '../races/schemas/race.schema';
import {
  Registration,
  RegistrationSchema,
} from '../registrations/schemas/registration.schema';
import {
  Prediction,
  PredictionSchema,
} from '../predictions/schemas/prediction.schema';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { RewardPointLedgerModule } from '../reward-point-ledger/reward-point-ledger.module';
import { TournamentsController } from './tournaments.controller';
import { TournamentsService } from './tournaments.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Tournament.name, schema: TournamentSchema },
      { name: Race.name, schema: RaceSchema },
      { name: Registration.name, schema: RegistrationSchema },
      { name: Prediction.name, schema: PredictionSchema },
    ]),
    NotificationsModule,
    AuditLogsModule,
    RewardPointLedgerModule,
  ],
  controllers: [TournamentsController],
  providers: [TournamentsService],
  exports: [TournamentsService],
})
export class TournamentsModule {}
