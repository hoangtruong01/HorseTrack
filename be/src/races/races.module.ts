import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TournamentsModule } from '../tournaments/tournaments.module';
import { PredictionsModule } from '../predictions/predictions.module';
import { Race, RaceSchema } from './schemas/race.schema';
import {
  Registration,
  RegistrationSchema,
} from '../registrations/schemas/registration.schema';
import {
  RaceCheck,
  RaceCheckSchema,
} from '../race-checks/schemas/race-check.schema';
import {
  RefereeAssignment,
  RefereeAssignmentSchema,
} from '../referee-assignments/schemas/referee-assignment.schema';
import { RacesController } from './races.controller';
import { RacesService } from './races.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Race.name, schema: RaceSchema },
      { name: Registration.name, schema: RegistrationSchema },
      { name: RaceCheck.name, schema: RaceCheckSchema },
      { name: RefereeAssignment.name, schema: RefereeAssignmentSchema },
    ]),
    TournamentsModule,
    PredictionsModule,
  ],
  controllers: [RacesController],
  providers: [RacesService],
  exports: [RacesService],
})
export class RacesModule {}
