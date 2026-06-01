import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RaceRecordDocument = RaceRecord & Document;

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class RaceRecord {
  @Prop({ type: Types.ObjectId, ref: 'Race', required: true, index: true })
  raceId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Horse', required: true, index: true })
  horseId!: Types.ObjectId;

  @Prop({ required: true })
  position!: number; // finishing position/rank

  @Prop({ required: true })
  finishTime!: number; // in seconds

  @Prop({ required: true })
  gateNumber!: number; // starting gate number

  @Prop({ default: 0 })
  speed!: number; // average speed in km/h

  @Prop({ default: 0 })
  distanceCovered!: number; // total distance in meters

  @Prop()
  injuryNotes?: string; // any injuries noted during the race
}

export const RaceRecordSchema = SchemaFactory.createForClass(RaceRecord);
