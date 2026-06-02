import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PaymentDocument = Payment & Document;

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AIPredictionPackage', required: true })
  packageId!: Types.ObjectId;

  @Prop({ required: true })
  amount!: number;

  @Prop({ required: true, default: 'WALLET' })
  paymentMethod!: 'WALLET' | 'BANK_TRANSFER' | 'CARD';

  @Prop({
    required: true,
    enum: PaymentStatus,
    default: PaymentStatus.SUCCESS,
  })
  status!: PaymentStatus;

  @Prop()
  transactionId?: string;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
