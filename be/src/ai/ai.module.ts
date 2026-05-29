import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from '../users/schemas/user.schema';
import {
  WalletTransaction,
  WalletTransactionSchema,
} from '../wallet/schemas/wallet-transaction.schema';
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
import {
  AIRaceArrangementSuggestion,
  AIRaceArrangementSuggestionSchema,
} from './schemas/ai-race-arrangement-suggestion.schema';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
      { name: AIPredictionPackage.name, schema: AIPredictionPackageSchema },
      { name: Payment.name, schema: PaymentSchema },
      { name: UserSubscription.name, schema: UserSubscriptionSchema },
      { name: AIPredictionSuggestion.name, schema: AIPredictionSuggestionSchema },
      {
        name: AIRaceArrangementSuggestion.name,
        schema: AIRaceArrangementSuggestionSchema,
      },
    ]),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
