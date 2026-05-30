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
import { RaceResultsController } from './race-results.controller';
import { RaceResultsService } from './race-results.service';
import { PrizesModule } from '../prizes/prizes.module';
import { PredictionsModule } from '../predictions/predictions.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RaceResult.name, schema: RaceResultSchema },
      { name: Registration.name, schema: RegistrationSchema },
      { name: RefereeAssignment.name, schema: RefereeAssignmentSchema },
    ]),
    RacesModule,
    PrizesModule,
    PredictionsModule,
  ],
  controllers: [RaceResultsController],
  providers: [RaceResultsService],
  exports: [RaceResultsService],
})
export class RaceResultsModule {}
