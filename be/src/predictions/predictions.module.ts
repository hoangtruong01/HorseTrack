import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Race, RaceSchema } from '../races/schemas/race.schema';
import {
  RaceResult,
  RaceResultSchema,
} from '../race-results/schemas/race-result.schema';
import {
  Registration,
  RegistrationSchema,
} from '../registrations/schemas/registration.schema';
import { Prediction, PredictionSchema } from './schemas/prediction.schema';
import { RewardPointLedgerModule } from '../reward-point-ledger/reward-point-ledger.module';
import { PredictionsController } from './predictions.controller';
import { PredictionsService } from './predictions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Prediction.name, schema: PredictionSchema },
      { name: Race.name, schema: RaceSchema },
      { name: RaceResult.name, schema: RaceResultSchema },
      { name: Registration.name, schema: RegistrationSchema },
    ]),
    RewardPointLedgerModule,
  ],
  controllers: [PredictionsController],
  providers: [PredictionsService],
  exports: [PredictionsService],
})
export class PredictionsModule {}
