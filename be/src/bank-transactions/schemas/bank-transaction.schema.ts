import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BankTransactionDocument = BankTransaction & Document;

export enum BankTransactionProvider {
  SEPAY = 'sepay',
  MANUAL = 'manual',
  OTHER = 'other',
}

export enum BankTransactionDirection {
  IN = 'in',
  OUT = 'out',
}

export enum BankTransactionMatchedType {
  PAYMENT = 'payment',
  PAYOUT = 'payout',
  UNKNOWN = 'unknown',
}

@Schema({ timestamps: true })
export class BankTransaction {
  @Prop({ required: true, enum: BankTransactionProvider })
  provider!: BankTransactionProvider;

  @Prop()
  providerTransactionId?: string;

  @Prop()
  bankTransactionCode?: string;

  @Prop({ required: true, enum: BankTransactionDirection })
  direction!: BankTransactionDirection;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true, default: 'VND' })
  currency!: string;

  @Prop()
  description?: string;

  @Prop()
  counterAccountNo?: string;

  @Prop()
  counterAccountName?: string;

  @Prop({ required: true })
  transactionTime!: Date;

  @Prop({
    required: true,
    enum: BankTransactionMatchedType,
    default: BankTransactionMatchedType.UNKNOWN,
  })
  matchedType!: BankTransactionMatchedType;

  @Prop({ type: Types.ObjectId })
  matchedId?: Types.ObjectId;

  @Prop({ type: Object })
  rawPayload?: Record<string, unknown>;
}

export const BankTransactionSchema =
  SchemaFactory.createForClass(BankTransaction);
BankTransactionSchema.index({ provider: 1 });
BankTransactionSchema.index({ direction: 1 });
BankTransactionSchema.index({ matchedType: 1 });
BankTransactionSchema.index({ transactionTime: -1 });
// Idempotency: unique per (provider, providerTransactionId) when providerTransactionId is set
BankTransactionSchema.index(
  { provider: 1, providerTransactionId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      providerTransactionId: { $exists: true, $ne: null },
    },
  },
);
