import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { RacesModule } from '../races/races.module';
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
    ]),
    RacesModule,
  ],
  controllers: [RefereeReportsController],
  providers: [RefereeReportsService],
  exports: [RefereeReportsService],
})
export class RefereeReportsModule {}
