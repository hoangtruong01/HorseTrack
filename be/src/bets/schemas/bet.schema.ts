import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type BetDocument = Bet & Document;

export enum BetStatus {
  PENDING = 'PENDING',
  WON = 'WON',
  LOST = 'LOST',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class Bet {
  @Prop({ type: Types.ObjectId, ref: 'Race', required: true, index: true })
  raceId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Horse', required: true })
  horseId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  amount!: number;

  @Prop({
    required: true,
    enum: BetStatus,
    default: BetStatus.PENDING,
  })
  status!: BetStatus;

  @Prop({ default: 2.0 })
  odds!: number;

  @Prop({ default: 0 })
  payout!: number;
}

export const BetSchema = SchemaFactory.createForClass(Bet);
