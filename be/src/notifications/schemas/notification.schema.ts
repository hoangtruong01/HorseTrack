import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  INFO = 'INFO',
  INVITATION = 'INVITATION',
  RESULT = 'RESULT',
  REGISTRATION = 'REGISTRATION',
}

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class Notification {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  message!: string;

  @Prop({
    required: true,
    enum: NotificationType,
    default: NotificationType.INFO,
  })
  type!: NotificationType;

  @Prop({ required: true, default: false })
  isRead!: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
