import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { User, UserSchema } from '../users/schemas/user.schema';
import { Race, RaceSchema } from '../races/schemas/race.schema';
import {
  Tournament,
  TournamentSchema,
} from '../tournaments/schemas/tournament.schema';
import { Horse, HorseSchema } from '../horses/schemas/horse.schema';
import {
  Registration,
  RegistrationSchema,
} from '../registrations/schemas/registration.schema';
import {
  RaceResult,
  RaceResultSchema,
} from '../race-results/schemas/race-result.schema';
import { Jockey, JockeySchema } from '../jockeys/schemas/jockey.schema';
import {
  AIPredictionPackage,
  AIPredictionPackageSchema,
} from './schemas/ai-prediction-package.schema';
import { Payment, PaymentSchema } from './schemas/payment.schema';
import {
  UserSubscription,
  UserSubscriptionSchema,
} from './schemas/user-subscription.schema';
import {
  AIPredictionSuggestion,
  AIPredictionSuggestionSchema,
} from './schemas/ai-prediction-suggestion.schema';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { LlmService } from './services/llm.service';
import { StrengthScoreService } from './services/strength-score.service';
import { PredictionEngineService } from './services/prediction-engine.service';
import { PayosService } from './services/payos.service';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Race.name, schema: RaceSchema },
      { name: Tournament.name, schema: TournamentSchema },
      { name: Horse.name, schema: HorseSchema },
      { name: Registration.name, schema: RegistrationSchema },
      { name: RaceResult.name, schema: RaceResultSchema },
      { name: Jockey.name, schema: JockeySchema },
      { name: AIPredictionPackage.name, schema: AIPredictionPackageSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: UserSubscription.name, schema: UserSubscriptionSchema },
      {
        name: AIPredictionSuggestion.name,
        schema: AIPredictionSuggestionSchema,
      },
    ]),
  ],
  controllers: [AiController],
  providers: [
    AiService,
    LlmService,
    StrengthScoreService,
    PredictionEngineService,
    PayosService,
  ],
  exports: [AiService],
})
export class AiModule {}
