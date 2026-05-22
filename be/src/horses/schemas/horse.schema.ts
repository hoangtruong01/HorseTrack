import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HorseDocument = Horse & Document;

export enum HorseGender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  GELDING = 'GELDING',
}

export enum HorseHealthStatus {
  HEALTHY = 'HEALTHY',
  INJURED = 'INJURED',
  RECOVERING = 'RECOVERING',
  RETIRED = 'RETIRED',
}

export enum HorseStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  RETIRED = 'RETIRED',
  DELETED = 'DELETED',
}

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class Horse {
  @Prop({ required: true })
  name!: string;

  @Prop()
  breed?: string;

  @Prop()
  age?: number;

  @Prop({ enum: HorseGender })
  gender?: HorseGender;

  @Prop()
  color?: string;

  @Prop()
  weight?: number;

  @Prop()
  height?: number;

  @Prop()
  dateOfBirth?: Date;

  @Prop({
    required: true,
    enum: HorseHealthStatus,
    default: HorseHealthStatus.HEALTHY,
  })
  healthStatus!: HorseHealthStatus;

  @Prop({
    required: true,
    enum: HorseStatus,
    default: HorseStatus.ACTIVE,
  })
  status!: HorseStatus;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId!: Types.ObjectId;

  @Prop()
  image?: string;

  @Prop()
  description?: string;

  @Prop()
  deletedAt?: Date;
}

export const HorseSchema = SchemaFactory.createForClass(Horse);

// Compound index for quick owner queries
HorseSchema.index({ ownerId: 1, status: 1 });
