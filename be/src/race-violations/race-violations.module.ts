import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RacesModule } from '../races/races.module';
import {
  RefereeAssignment,
  RefereeAssignmentSchema,
} from '../referee-assignments/schemas/referee-assignment.schema';
import {
  RaceViolation,
  RaceViolationSchema,
} from './schemas/race-violation.schema';
import { RaceViolationsController } from './race-violations.controller';
import { RaceViolationsService } from './race-violations.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RaceViolation.name, schema: RaceViolationSchema },
      { name: RefereeAssignment.name, schema: RefereeAssignmentSchema },
    ]),
    RacesModule,
  ],
  controllers: [RaceViolationsController],
  providers: [RaceViolationsService],
  exports: [RaceViolationsService],
})
export class RaceViolationsModule {}
