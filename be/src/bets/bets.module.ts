import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Bet, BetSchema } from './schemas/bet.schema';
import { Race, RaceSchema } from '../races/schemas/race.schema';
import {
  RaceResult,
  RaceResultSchema,
} from '../race-results/schemas/race-result.schema';
import { BetsController } from './bets.controller';
import { BetsService } from './bets.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Bet.name, schema: BetSchema },
      { name: Race.name, schema: RaceSchema },
      { name: RaceResult.name, schema: RaceResultSchema },
    ]),
  ],
  controllers: [BetsController],
  providers: [BetsService],
  exports: [BetsService],
})
export class BetsModule {}
