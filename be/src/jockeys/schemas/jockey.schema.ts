import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JockeyDocument = Jockey & Document;

export enum JockeyStatus {
  AVAILABLE = 'available',
  UNAVAILABLE = 'unavailable',
  SUSPENDED = 'suspended',
}

export enum JockeySkillLevel {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  PROFESSIONAL = 'professional',
}

export enum JockeyApprovalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
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

  @Prop({ required: true, min: 100 })
  heightCm!: number;

  @Prop({ required: true, min: 30 })
  weightKg!: number;

  @Prop({ default: 0 })
  experienceYears?: number;

  @Prop({ required: true, enum: JockeyStatus, default: JockeyStatus.AVAILABLE })
  status!: JockeyStatus;

  @Prop({
    required: true,
    enum: JockeyApprovalStatus,
    default: JockeyApprovalStatus.PENDING,
  })
  approvalStatus!: JockeyApprovalStatus;

  @Prop()
  rejectionReason?: string;

  @Prop({ enum: JockeySkillLevel })
  skillLevel?: JockeySkillLevel;

  @Prop()
  licenseNumber?: string;

  @Prop()
  certificates?: string;

  @Prop()
  licenseImage?: string;

  @Prop()
  bio?: string;

  @Prop()
  specialty?: string;

  @Prop()
  personality?: string;
}

export const JockeySchema = SchemaFactory.createForClass(Jockey);
JockeySchema.index({ status: 1 });
JockeySchema.index({ approvalStatus: 1 });
