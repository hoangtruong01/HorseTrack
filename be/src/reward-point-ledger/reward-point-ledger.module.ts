import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  RewardPointLedger,
  RewardPointLedgerSchema,
} from './schemas/reward-point-ledger.schema';
import { User, UserSchema } from '../users/schemas/user.schema';
import { RewardPointLedgerController } from './reward-point-ledger.controller';
import { RewardPointLedgerService } from './reward-point-ledger.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: RewardPointLedger.name, schema: RewardPointLedgerSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [RewardPointLedgerController],
  providers: [RewardPointLedgerService],
  exports: [RewardPointLedgerService],
})
export class RewardPointLedgerModule {}
