import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RacesModule } from '../races/races.module';
import {
  Registration,
  RegistrationSchema,
} from '../registrations/schemas/registration.schema';
import {
  RefereeAssignment,
  RefereeAssignmentSchema,
} from '../referee-assignments/schemas/referee-assignment.schema';
import { RaceCheck, RaceCheckSchema } from './schemas/race-check.schema';
import { RaceChecksController } from './race-checks.controller';
import { RaceChecksService } from './race-checks.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RaceCheck.name, schema: RaceCheckSchema },
      { name: Registration.name, schema: RegistrationSchema },
      { name: RefereeAssignment.name, schema: RefereeAssignmentSchema },
    ]),
    RacesModule,
  ],
  controllers: [RaceChecksController],
  providers: [RaceChecksService],
  exports: [RaceChecksService],
})
export class RaceChecksModule {}
