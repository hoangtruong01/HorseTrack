import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PredictionDocument = Prediction & Document;

export enum PredictionStatus {
  PENDING = 'PENDING',
  WON = 'WON',
  LOST = 'LOST',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class Prediction {
  @Prop({ type: Types.ObjectId, ref: 'Race', required: true, index: true })
  raceId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Horse', required: true })
  horseId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, default: 1 })
  predictedPosition!: number;

  @Prop({
    required: true,
    enum: PredictionStatus,
    default: PredictionStatus.PENDING,
  })
  status!: PredictionStatus;

  @Prop({ default: false })
  isCorrect?: boolean;

  @Prop({ default: 0 })
  pointsEarned!: number;
}

export const PredictionSchema = SchemaFactory.createForClass(Prediction);
