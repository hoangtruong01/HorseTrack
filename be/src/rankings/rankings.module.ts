import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RaceResult,
  RaceResultSchema,
} from '../race-results/schemas/race-result.schema';
import { RankingsController } from './rankings.controller';
import { RankingsService } from './rankings.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RaceResult.name, schema: RaceResultSchema },
    ]),
  ],
  controllers: [RankingsController],
  providers: [RankingsService],
})
export class RankingsModule {}
