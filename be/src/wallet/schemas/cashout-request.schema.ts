import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type CashoutRequestDocument = CashoutRequest & Document;

export enum CashoutStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PAID = 'PAID',
}

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class CashoutRequest {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  requestedAmount!: number; // how much money they want to receive

  @Prop({ required: true, default: 0 })
  pointsRedeemed!: number; // how many points they are redeeming

  @Prop({
    required: true,
    enum: CashoutStatus,
    default: CashoutStatus.PENDING,
  })
  status!: CashoutStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  paidBy?: Types.ObjectId; // Counter Staff or Admin

  @Prop()
  paidAt?: Date;
}

export const CashoutRequestSchema = SchemaFactory.createForClass(CashoutRequest);
