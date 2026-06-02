import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RaceResultDocument = RaceResult & Document;

export enum RaceResultStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  PUBLISHED = 'PUBLISHED',
  CANCELLED = 'CANCELLED',
}

export enum RaceResultOutcome {
  FINISHED = 'finished',
  DISQUALIFIED = 'disqualified',
  DID_NOT_START = 'did_not_start',
  DID_NOT_FINISH = 'did_not_finish',
}

export enum RaceIncident {
  NONE = 'NONE',
  BAD_START = 'BAD_START',
  LOSE_RHYTHM = 'LOSE_RHYTHM',
  TIRED_FINISH = 'TIRED_FINISH',
  DISQUALIFIED = 'DISQUALIFIED',
}

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class RaceResult {
  @Prop({
    type: Types.ObjectId,
    ref: 'Tournament',
    required: true,
    index: true,
  })
  tournamentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Race', required: true })
  raceId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Registration', required: true })
  raceRegistrationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Horse', required: true })
  horseId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  jockeyUserId?: Types.ObjectId;

  @Prop()
  rank?: number;

  @Prop()
  finishTimeMs?: number;

  @Prop({ default: 0 })
  points?: number;

  @Prop({ default: 0 })
  prizeAmount!: number;

  @Prop({ required: true, enum: RaceResultOutcome })
  outcome!: RaceResultOutcome;

  @Prop({ required: true, enum: RaceIncident, default: RaceIncident.NONE })
  incident!: RaceIncident;

  @Prop()
  finalScore?: number;

  @Prop({
    required: true,
    enum: RaceResultStatus,
    default: RaceResultStatus.DRAFT,
  })
  status!: RaceResultStatus;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  recordedBy?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  confirmedBy?: Types.ObjectId;

  @Prop()
  confirmedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  publishedBy?: Types.ObjectId;

  @Prop()
  publishedAt?: Date;

  @Prop()
  note?: string;
}

export const RaceResultSchema = SchemaFactory.createForClass(RaceResult);

// One result per horse per race
RaceResultSchema.index({ raceId: 1, horseId: 1 }, { unique: true });
RaceResultSchema.index({ raceId: 1, rank: 1 });
RaceResultSchema.index({ raceId: 1, status: 1 });
RaceResultSchema.index({ raceRegistrationId: 1 });
RaceResultSchema.index({ outcome: 1 });
