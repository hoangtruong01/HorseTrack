import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { RacesModule } from '../races/races.module';
import { RefereeProfilesModule } from '../referee-profiles/referee-profiles.module';
import { Race, RaceSchema } from '../races/schemas/race.schema';
import {
  RefereeAssignment,
  RefereeAssignmentSchema,
} from './schemas/referee-assignment.schema';
import { RefereeAssignmentsController } from './referee-assignments.controller';
import { RefereeAssignmentsService } from './referee-assignments.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefereeAssignment.name, schema: RefereeAssignmentSchema },
      { name: Race.name, schema: RaceSchema },
    ]),
    UsersModule,
    RacesModule,
    RefereeProfilesModule,
  ],
  controllers: [RefereeAssignmentsController],
  providers: [RefereeAssignmentsService],
  exports: [RefereeAssignmentsService],
})
export class RefereeAssignmentsModule {}
