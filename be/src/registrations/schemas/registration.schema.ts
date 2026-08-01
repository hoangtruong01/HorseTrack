import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RegistrationDocument = Registration & Document;

export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  WITHDRAWN = 'WITHDRAWN',
}

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class Registration {
  @Prop({ type: Types.ObjectId, ref: 'Tournament', required: true })
  tournamentId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Race', required: true })
  raceId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Horse', required: true })
  horseId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  jockeyUserId?: Types.ObjectId;

  @Prop({
    required: true,
    enum: RegistrationStatus,
    default: RegistrationStatus.PENDING,
  })
  status!: RegistrationStatus;

  @Prop()
  note?: string;

  @Prop()
  rejectedReason?: string;

  @Prop()
  approvedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;

  @Prop({ default: 30, min: 5, max: 50 })
  jockeySharePercent?: number;

  /** Điểm phí đã trừ khi đăng ký (10% prize tại thời điểm tạo). */
  @Prop({ default: 0 })
  feePaid?: number;

  /** Điểm phí đã hoàn lại (0 = chưa hoàn). Dùng làm cờ idempotent. */
  @Prop({ default: 0 })
  feeRefunded?: number;
}

export const RegistrationSchema = SchemaFactory.createForClass(Registration);

// A horse can only register once per race
RegistrationSchema.index({ raceId: 1, horseId: 1 }, { unique: true });
RegistrationSchema.index({ ownerId: 1 });
RegistrationSchema.index({ tournamentId: 1, status: 1 });
RegistrationSchema.index({ raceId: 1, status: 1 });
