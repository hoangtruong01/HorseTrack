import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JockeyInvitationDocument = JockeyInvitation & Document;

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class JockeyInvitation {
  @Prop({ type: Types.ObjectId, ref: 'Registration', required: true })
  registrationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Race', required: true })
  raceId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Horse', required: true })
  horseId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  jockeyUserId!: Types.ObjectId;

  @Prop({
    required: true,
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status!: InvitationStatus;

  @Prop()
  message?: string;

  @Prop()
  respondedAt?: Date;

  @Prop()
  expiredAt?: Date;
}

export const JockeyInvitationSchema =
  SchemaFactory.createForClass(JockeyInvitation);

JockeyInvitationSchema.index({ registrationId: 1 });
JockeyInvitationSchema.index({ raceId: 1 });
JockeyInvitationSchema.index({ ownerId: 1 });
JockeyInvitationSchema.index({ jockeyUserId: 1, status: 1 });
JockeyInvitationSchema.index({ raceId: 1, jockeyUserId: 1 });
