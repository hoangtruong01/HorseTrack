import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type WalletTransactionDocument = WalletTransaction & Document;

export enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAW = 'WITHDRAW',
  PURCHASE = 'PURCHASE',
  POINT_REDEMPTION = 'POINT_REDEMPTION',
  PRIZE_EARNING = 'PRIZE_EARNING',
  REWARD_CASHOUT = 'REWARD_CASHOUT',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class WalletTransaction {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({
    required: true,
    enum: TransactionType,
  })
  type!: TransactionType;

  @Prop({ required: true, default: 0 })
  amount!: number; // cash/money amount

  @Prop({ required: true, default: 0 })
  points!: number; // points amount

  @Prop()
  description?: string;

  @Prop({
    required: true,
    enum: TransactionStatus,
    default: TransactionStatus.SUCCESS,
  })
  status!: TransactionStatus;
}

export const WalletTransactionSchema = SchemaFactory.createForClass(WalletTransaction);
