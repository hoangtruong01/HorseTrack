import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RaceDocument = Race & Document;

export enum RaceStatus {
  SCHEDULED = 'SCHEDULED',
  CHECKING = 'CHECKING',
  READY = 'READY',
  LIVE = 'LIVE',
  FINISHED = 'FINISHED',
  RESULT_PUBLISHED = 'RESULT_PUBLISHED',
  CANCELLED = 'CANCELLED',
}

export const RACE_STATUS_FLOW: Record<RaceStatus, RaceStatus[]> = {
  [RaceStatus.SCHEDULED]: [RaceStatus.CHECKING, RaceStatus.CANCELLED],
  [RaceStatus.CHECKING]: [RaceStatus.READY, RaceStatus.CANCELLED],
  [RaceStatus.READY]: [RaceStatus.LIVE, RaceStatus.CANCELLED],
  [RaceStatus.LIVE]: [RaceStatus.FINISHED, RaceStatus.CANCELLED],
  [RaceStatus.FINISHED]: [RaceStatus.RESULT_PUBLISHED, RaceStatus.CANCELLED],
  [RaceStatus.RESULT_PUBLISHED]: [],
  [RaceStatus.CANCELLED]: [],
};

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class Race {
  @Prop({ type: Types.ObjectId, ref: 'Tournament', required: true })
  tournamentId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop()
  raceNumber?: number;

  @Prop({ required: true })
  startTime!: Date;

  @Prop()
  endTime?: Date;

  @Prop()
  location?: string;

  @Prop({ required: true, min: 100 })
  distanceMeters!: number;

  @Prop({ default: 1, min: 1 })
  lapCount!: number;

  @Prop({ default: 20, min: 2 })
  maxParticipants!: number;

  @Prop({ default: 0 })
  totalPrize?: number;

  @Prop({ default: 0 })
  prizeFirst?: number;

  @Prop({ default: 0 })
  prizeSecond?: number;

  @Prop({ default: 0 })
  prizeThird?: number;

  @Prop({ required: true, enum: RaceStatus, default: RaceStatus.SCHEDULED })
  status!: RaceStatus;

  @Prop()
  trackCondition?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;

  @Prop()
  deletedAt?: Date;
}

export const RaceSchema = SchemaFactory.createForClass(Race);

RaceSchema.index({ tournamentId: 1 });
RaceSchema.index({ startTime: 1 });
RaceSchema.index({ status: 1 });
RaceSchema.index({ tournamentId: 1, startTime: 1 });
