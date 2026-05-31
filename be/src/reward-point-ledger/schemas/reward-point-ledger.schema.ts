import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RewardPointLedgerDocument = RewardPointLedger & Document;

export enum LedgerSourceType {
  PREDICTION_REWARD = 'prediction_reward',
  REDEMPTION = 'redemption',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
  EXPIRED = 'expired',
}

@Schema({ timestamps: true })
export class RewardPointLedger {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, enum: LedgerSourceType })
  sourceType!: LedgerSourceType;

  @Prop({ type: Types.ObjectId })
  sourceId?: Types.ObjectId;

  @Prop({ required: true })
  pointsDelta!: number;

  @Prop({ required: true })
  balanceAfter!: number;

  @Prop()
  note?: string;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  createdBy?: Types.ObjectId;
}

export const RewardPointLedgerSchema =
  SchemaFactory.createForClass(RewardPointLedger);
RewardPointLedgerSchema.index({ userId: 1 });
RewardPointLedgerSchema.index({ sourceType: 1 });
RewardPointLedgerSchema.index({ createdAt: -1 });
