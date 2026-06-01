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

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Horse', required: true })
  predictedHorseId!: Types.ObjectId;

  @Prop({
    required: true,
    enum: PredictionStatus,
    default: PredictionStatus.PENDING,
  })
  status!: PredictionStatus;

  @Prop({ default: 0 })
  rewardPoints!: number;

  @Prop()
  evaluatedAt?: Date;
}

export const PredictionSchema = SchemaFactory.createForClass(Prediction);

// One prediction per user per race
PredictionSchema.index({ raceId: 1, userId: 1 }, { unique: true });
PredictionSchema.index({ status: 1 });
