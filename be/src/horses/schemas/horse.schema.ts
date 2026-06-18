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

export enum HorseApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({
  timestamps: true,
  toObject: { virtuals: true },
  toJSON: { virtuals: true },
})
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
  weightKg?: number;

  @Prop()
  heightCm?: number;

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

  @Prop({
    required: true,
    enum: HorseApprovalStatus,
    default: HorseApprovalStatus.PENDING,
  })
  approvalStatus!: HorseApprovalStatus;

  @Prop()
  rejectionReason?: string;

  @Prop()
  rejectedAt?: Date;

  @Prop()
  approvedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  ownerId!: Types.ObjectId;

  @Prop({ default: 60, min: 30, max: 100 })
  baseSpeed!: number;

  @Prop({ default: 70, min: 30, max: 100 })
  staminaScore!: number;

  @Prop()
  image?: string;

  @Prop({ type: [String], default: [] })
  images?: string[];

  @Prop()
  description?: string;

  @Prop({ default: 0 })
  winCount!: number;

  @Prop({ default: 0 })
  totalRaces!: number;

  @Prop()
  deletedAt?: Date;
}

export const HorseSchema = SchemaFactory.createForClass(Horse);

// Compound index for quick owner queries
HorseSchema.index({ ownerId: 1, status: 1 });
