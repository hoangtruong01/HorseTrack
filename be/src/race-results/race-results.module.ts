import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RacesModule } from '../races/races.module';
import { RaceResult, RaceResultSchema } from './schemas/race-result.schema';
import {
  Registration,
  RegistrationSchema,
} from '../registrations/schemas/registration.schema';
import {
  RefereeAssignment,
  RefereeAssignmentSchema,
} from '../referee-assignments/schemas/referee-assignment.schema';
import { PrizesModule } from '../prizes/prizes.module';
import { PredictionsModule } from '../predictions/predictions.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Jockey, JockeySchema } from '../jockeys/schemas/jockey.schema';
import {
  RaceViolation,
  RaceViolationSchema,
} from '../race-violations/schemas/race-violation.schema';
import { RaceResultsController } from './race-results.controller';
import { RaceResultsService } from './race-results.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RaceResult.name, schema: RaceResultSchema },
      { name: Registration.name, schema: RegistrationSchema },
      { name: RefereeAssignment.name, schema: RefereeAssignmentSchema },
      { name: Jockey.name, schema: JockeySchema },
      { name: RaceViolation.name, schema: RaceViolationSchema },
    ]),
    RacesModule,
    PrizesModule,
    PredictionsModule,
    AuditLogsModule,
    NotificationsModule,
  ],
  controllers: [RaceResultsController],
  providers: [RaceResultsService],
  exports: [RaceResultsService],
})
export class RaceResultsModule {}
