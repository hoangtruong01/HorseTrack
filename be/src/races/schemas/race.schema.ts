import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RaceDocument = Race & Document;

export enum RaceStatus {
  SCHEDULED = 'SCHEDULED',
  CHECKING = 'CHECKING',
  ONGOING = 'ONGOING',
  FINISHED = 'FINISHED',
  RESULT_PUBLISHED = 'RESULT_PUBLISHED',
  CANCELLED = 'CANCELLED',
}

export const RACE_STATUS_FLOW: Record<RaceStatus, RaceStatus[]> = {
  [RaceStatus.SCHEDULED]: [
    RaceStatus.CHECKING,
    RaceStatus.ONGOING,
    RaceStatus.CANCELLED,
  ],
  [RaceStatus.CHECKING]: [RaceStatus.ONGOING, RaceStatus.CANCELLED],
  [RaceStatus.ONGOING]: [RaceStatus.FINISHED, RaceStatus.CANCELLED],
  [RaceStatus.FINISHED]: [RaceStatus.RESULT_PUBLISHED, RaceStatus.CANCELLED],
  [RaceStatus.RESULT_PUBLISHED]: [],
  [RaceStatus.CANCELLED]: [],
};

@Schema({ _id: false })
export class RaceHorseEntry {
  @Prop({ type: Types.ObjectId, ref: 'Horse', required: true })
  horseId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  jockeyId?: Types.ObjectId;

  @Prop()
  gateNumber?: number;
}

export const RaceHorseEntrySchema =
  SchemaFactory.createForClass(RaceHorseEntry);

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class Race {
  @Prop({ type: Types.ObjectId, ref: 'Tournament', required: true })
  tournamentId!: Types.ObjectId;

  @Prop({ required: true })
  name!: string;

  @Prop()
  raceNumber?: number;

  @Prop({ required: true })
  scheduledAt!: Date;

  @Prop()
  location?: string;

  @Prop()
  distance?: number;

  @Prop({
    required: true,
    enum: RaceStatus,
    default: RaceStatus.SCHEDULED,
  })
  status!: RaceStatus;

  @Prop({ type: [RaceHorseEntrySchema], default: [] })
  horses!: RaceHorseEntry[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], default: [] })
  refereeIds!: Types.ObjectId[];

  @Prop()
  trackCondition?: string;

  @Prop()
  deletedAt?: Date;
}

export const RaceSchema = SchemaFactory.createForClass(Race);

RaceSchema.index({ tournamentId: 1 });
RaceSchema.index({ scheduledAt: 1 });
RaceSchema.index({ status: 1 });
