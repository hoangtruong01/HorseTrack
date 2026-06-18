import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WalletTransaction,
  WalletTransactionSchema,
} from './schemas/wallet-transaction.schema';
import {
  CashoutRequest,
  CashoutRequestSchema,
} from './schemas/cashout-request.schema';
import { RewardPointLedgerModule } from '../reward-point-ledger/reward-point-ledger.module';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WalletTransaction.name, schema: WalletTransactionSchema },
      { name: CashoutRequest.name, schema: CashoutRequestSchema },
    ]),
    RewardPointLedgerModule,
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
