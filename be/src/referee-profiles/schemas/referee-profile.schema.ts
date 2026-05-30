import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RefereeProfileDocument = RefereeProfile & Document;

export enum RefereeProfileStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  SUSPENDED = 'suspended',
}

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class RefereeProfile {
  @Prop({
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  })
  userId!: Types.ObjectId;

  @Prop()
  licenseNo?: string;

  @Prop({ default: 0, min: 0 })
  experienceYears!: number;

  @Prop({
    required: true,
    enum: RefereeProfileStatus,
    default: RefereeProfileStatus.AVAILABLE,
  })
  status!: RefereeProfileStatus;

  @Prop()
  deletedAt?: Date;
}

export const RefereeProfileSchema =
  SchemaFactory.createForClass(RefereeProfile);
RefereeProfileSchema.index({ userId: 1 }, { unique: true });
RefereeProfileSchema.index({ status: 1 });
