import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  BankTransaction,
  BankTransactionSchema,
} from './schemas/bank-transaction.schema';
import { BankTransactionsController } from './bank-transactions.controller';
import { BankTransactionsService } from './bank-transactions.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BankTransaction.name, schema: BankTransactionSchema },
    ]),
  ],
  controllers: [BankTransactionsController],
  providers: [BankTransactionsService],
  exports: [BankTransactionsService],
})
export class BankTransactionsModule {}
