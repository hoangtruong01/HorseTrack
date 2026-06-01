import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RacesModule } from '../races/races.module';
import {
  RefereeAssignment,
  RefereeAssignmentSchema,
} from '../referee-assignments/schemas/referee-assignment.schema';
import {
  RefereeReport,
  RefereeReportSchema,
} from './schemas/referee-report.schema';
import { RefereeReportsController } from './referee-reports.controller';
import { RefereeReportsService } from './referee-reports.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RefereeReport.name, schema: RefereeReportSchema },
      { name: RefereeAssignment.name, schema: RefereeAssignmentSchema },
    ]),
    RacesModule,
  ],
  controllers: [RefereeReportsController],
  providers: [RefereeReportsService],
  exports: [RefereeReportsService],
})
export class RefereeReportsModule {}
