import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PrizeDocument = Prize & Document;

export enum PrizePaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
}

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class Prize {
  @Prop({
    type: Types.ObjectId,
    ref: 'Tournament',
    required: true,
    index: true,
  })
  tournamentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Race', required: true, index: true })
  raceId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Horse', required: true })
  horseId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId!: Types.ObjectId;

  @Prop({ required: true })
  rank!: number;

  @Prop({ required: true, default: 0 })
  amount!: number;

  @Prop({
    required: true,
    enum: PrizePaymentStatus,
    default: PrizePaymentStatus.PENDING,
  })
  status!: PrizePaymentStatus;

  @Prop()
  paidAt?: Date;
}

export const PrizeSchema = SchemaFactory.createForClass(Prize);

// One prize entry per owner/jockey per horse per race
PrizeSchema.index({ raceId: 1, horseId: 1, ownerId: 1 }, { unique: true });
