import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserSubscriptionDocument = UserSubscription & Document;

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class UserSubscription {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'AIPredictionPackage', required: true })
  packageId!: Types.ObjectId;

  @Prop({ required: true })
  startDate!: Date;

  @Prop({ required: true })
  endDate!: Date;

  @Prop({ required: true, default: 'ACTIVE' })
  status!: 'ACTIVE' | 'EXPIRED' | 'CANCELLED';
}

export const UserSubscriptionSchema = SchemaFactory.createForClass(UserSubscription);
