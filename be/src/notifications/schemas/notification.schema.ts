import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  RACE = 'race',
  PREDICTION = 'prediction',
  REWARD = 'reward',
  PAYMENT = 'payment',
  PAYOUT = 'payout',
  SYSTEM = 'system',
}

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  body!: string;

  @Prop({
    required: true,
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type!: NotificationType;

  @Prop({ required: true, default: false })
  isRead!: boolean;

  @Prop({ type: Object })
  data?: Record<string, unknown>;

  @Prop()
  readAt?: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
NotificationSchema.index({ userId: 1 });
NotificationSchema.index({ isRead: 1 });
NotificationSchema.index({ createdAt: -1 });
