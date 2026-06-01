import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Race, RaceSchema } from '../races/schemas/race.schema';
import { Horse, HorseSchema } from '../horses/schemas/horse.schema';
import { RaceRecord, RaceRecordSchema } from './schemas/race-record.schema';
import { RaceRecordsController } from './race-records.controller';
import { RaceRecordsService } from './race-records.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RaceRecord.name, schema: RaceRecordSchema },
      { name: Race.name, schema: RaceSchema },
      { name: Horse.name, schema: HorseSchema },
    ]),
  ],
  controllers: [RaceRecordsController],
  providers: [RaceRecordsService],
  exports: [RaceRecordsService],
})
export class RaceRecordsModule {}
