import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type JockeyInvitationDocument = JockeyInvitation & Document;

export enum InvitationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class JockeyInvitation {
  @Prop({ type: Types.ObjectId, ref: 'Registration', required: true })
  registrationId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  jockeyId!: Types.ObjectId;

  @Prop({
    required: true,
    enum: InvitationStatus,
    default: InvitationStatus.PENDING,
  })
  status!: InvitationStatus;

  @Prop()
  message?: string;
}

export const JockeyInvitationSchema =
  SchemaFactory.createForClass(JockeyInvitation);

JockeyInvitationSchema.index({ registrationId: 1, jockeyId: 1 });
JockeyInvitationSchema.index({ jockeyId: 1, status: 1 });
