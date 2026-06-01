import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Prize, PrizeSchema } from './schemas/prize.schema';
import {
  RaceResult,
  RaceResultSchema,
} from '../race-results/schemas/race-result.schema';
import { Race, RaceSchema } from '../races/schemas/race.schema';
import { Horse, HorseSchema } from '../horses/schemas/horse.schema';
import { PrizesController } from './prizes.controller';
import { PrizesService } from './prizes.service';
import { RewardPointLedgerModule } from '../reward-point-ledger/reward-point-ledger.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Prize.name, schema: PrizeSchema },
      { name: RaceResult.name, schema: RaceResultSchema },
      { name: Race.name, schema: RaceSchema },
      { name: Horse.name, schema: HorseSchema },
    ]),
    RewardPointLedgerModule,
  ],
  controllers: [PrizesController],
  providers: [PrizesService],
  exports: [PrizesService],
})
export class PrizesModule {}
