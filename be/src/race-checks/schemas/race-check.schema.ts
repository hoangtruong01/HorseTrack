import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RaceCheckDocument = RaceCheck & Document;

export enum RaceCheckStatus {
  PENDING = 'pending',
  PASSED = 'passed',
  FAILED = 'failed',
}

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class RaceCheck {
  @Prop({ type: Types.ObjectId, ref: 'Race', required: true })
  raceId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Registration', required: true })
  raceRegistrationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Horse', required: true })
  horseId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  checkedBy!: Types.ObjectId;

  @Prop({
    required: true,
    enum: RaceCheckStatus,
    default: RaceCheckStatus.PENDING,
  })
  status!: RaceCheckStatus;

  @Prop()
  healthNote?: string;

  @Prop()
  equipmentNote?: string;

  @Prop()
  checkedAt?: Date;
}

export const RaceCheckSchema = SchemaFactory.createForClass(RaceCheck);
RaceCheckSchema.index({ raceId: 1 });
RaceCheckSchema.index({ raceRegistrationId: 1 });
RaceCheckSchema.index({ checkedBy: 1 });
RaceCheckSchema.index({ status: 1 });
// One check record per registration per race
RaceCheckSchema.index({ raceId: 1, raceRegistrationId: 1 }, { unique: true });
