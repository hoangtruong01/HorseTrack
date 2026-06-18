import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { HorsesModule } from '../horses/horses.module';
import { TournamentsModule } from '../tournaments/tournaments.module';
import { RacesModule } from '../races/races.module';
import {
  Registration,
  RegistrationSchema,
} from './schemas/registration.schema';
import {
  RaceResult,
  RaceResultSchema,
} from '../race-results/schemas/race-result.schema';
import { RegistrationsController } from './registrations.controller';
import { RegistrationsService } from './registrations.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { PredictionsModule } from '../predictions/predictions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Registration.name, schema: RegistrationSchema },
      { name: RaceResult.name, schema: RaceResultSchema },
    ]),
    HorsesModule,
    TournamentsModule,
    RacesModule,
    NotificationsModule,
    AuditLogsModule,
    PredictionsModule,
  ],
  controllers: [RegistrationsController],
  providers: [RegistrationsService],
  exports: [RegistrationsService],
})
export class RegistrationsModule {}
