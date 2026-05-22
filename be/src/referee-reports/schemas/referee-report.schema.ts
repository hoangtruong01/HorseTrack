import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RefereeReportDocument = RefereeReport & Document;

export enum ReportType {
  PRE_RACE = 'PRE_RACE',
  POST_RACE = 'POST_RACE',
}

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class RefereeReport {
  @Prop({ type: Types.ObjectId, ref: 'Race', required: true, index: true })
  raceId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  refereeId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Horse', required: true })
  horseId!: Types.ObjectId;

  @Prop({
    required: true,
    enum: ReportType,
    default: ReportType.POST_RACE,
  })
  type!: ReportType;

  @Prop({ required: true })
  description!: string;

  @Prop()
  violation?: string;

  @Prop()
  penalty?: string;
}

export const RefereeReportSchema = SchemaFactory.createForClass(RefereeReport);
