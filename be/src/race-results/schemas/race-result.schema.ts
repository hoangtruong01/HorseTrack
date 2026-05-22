import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RaceResultDocument = RaceResult & Document;

export enum RaceResultStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
}

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class RaceResult {
  @Prop({ type: Types.ObjectId, ref: 'Race', required: true })
  raceId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Horse', required: true })
  horseId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  jockeyId?: Types.ObjectId;

  @Prop({ required: true })
  rank!: number;

  @Prop()
  finishTime?: number; // seconds

  @Prop({ default: 0 })
  points?: number;

  @Prop()
  violation?: string;

  @Prop({
    required: true,
    enum: RaceResultStatus,
    default: RaceResultStatus.DRAFT,
  })
  status!: RaceResultStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  recordedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  publishedBy?: Types.ObjectId;

  @Prop()
  publishedAt?: Date;
}

export const RaceResultSchema = SchemaFactory.createForClass(RaceResult);

// One result per horse per race
RaceResultSchema.index({ raceId: 1, horseId: 1 }, { unique: true });
RaceResultSchema.index({ raceId: 1, rank: 1 });
