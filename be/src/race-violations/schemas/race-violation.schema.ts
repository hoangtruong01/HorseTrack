import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RaceViolationDocument = RaceViolation & Document;

export enum ViolationType {
  FALSE_START = 'false_start',
  DANGEROUS_RIDING = 'dangerous_riding',
  TRACK_VIOLATION = 'track_violation',
  EQUIPMENT_VIOLATION = 'equipment_violation',
  OTHER = 'other',
}

export enum ViolationSeverity {
  MINOR = 'minor',
  MAJOR = 'major',
  CRITICAL = 'critical',
}

export enum ViolationPenalty {
  WARNING = 'warning',
  TIME_PENALTY = 'time_penalty',
  DISQUALIFIED = 'disqualified',
  NONE = 'none',
}

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class RaceViolation {
  @Prop({ type: Types.ObjectId, ref: 'Race', required: true })
  raceId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Registration' })
  raceRegistrationId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Horse' })
  horseId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  jockeyUserId?: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reportedBy!: Types.ObjectId;

  @Prop({ required: true, enum: ViolationType })
  type!: ViolationType;

  @Prop({ required: true, enum: ViolationSeverity })
  severity!: ViolationSeverity;

  @Prop({
    required: true,
    enum: ViolationPenalty,
    default: ViolationPenalty.NONE,
  })
  penalty!: ViolationPenalty;

  @Prop()
  description?: string;
}

export const RaceViolationSchema = SchemaFactory.createForClass(RaceViolation);
RaceViolationSchema.index({ raceId: 1 });
RaceViolationSchema.index({ horseId: 1 });
RaceViolationSchema.index({ reportedBy: 1 });
RaceViolationSchema.index({ type: 1 });
RaceViolationSchema.index({ severity: 1 });
