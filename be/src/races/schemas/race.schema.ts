import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { WeatherCondition, RaceType } from '../../common/enums/race.enums';

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
  [RaceStatus.READY]: [
    RaceStatus.LIVE,
    RaceStatus.CHECKING,
    RaceStatus.CANCELLED,
  ],
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

  @Prop({ type: Number, min: 0 })
  minWeightKg?: number;

  @Prop({ type: Number, min: 0 })
  maxWeightKg?: number;

  @Prop({ default: 0 })
  prize?: number;

  @Prop({ required: true, enum: RaceStatus, default: RaceStatus.SCHEDULED })
  status!: RaceStatus;

  @Prop({ type: String })
  trackCondition?: string;

  @Prop({ type: String, enum: WeatherCondition })
  weather?: WeatherCondition;

  @Prop({ type: String, enum: RaceType })
  raceType?: RaceType;

  @Prop({ default: 'Sunny' })
  weatherSnapshot?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;

  @Prop()
  imageUrl?: string;

  @Prop()
  deletedAt?: Date;
}

export const RaceSchema = SchemaFactory.createForClass(Race);

RaceSchema.index({ tournamentId: 1 });
RaceSchema.index({ startTime: 1 });
RaceSchema.index({ status: 1 });
RaceSchema.index({ tournamentId: 1, startTime: 1 });
RaceSchema.index({ deletedAt: 1 });
