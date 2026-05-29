import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JockeyDocument = Jockey & Document;

export enum JockeyStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
}

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class Jockey {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  height!: number; // in cm

  @Prop({ required: true })
  weight!: number; // in kg

  @Prop({ default: 0 })
  experienceYears?: number;

  @Prop({
    required: true,
    enum: JockeyStatus,
    default: JockeyStatus.ACTIVE,
  })
  status!: JockeyStatus;

  @Prop({ default: 0 })
  skillBonus?: number;

  @Prop()
  rank?: string;

  @Prop()
  bio?: string;
}

export const JockeySchema = SchemaFactory.createForClass(Jockey);
