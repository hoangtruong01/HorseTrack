import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AIPredictionPackageDocument = AIPredictionPackage & Document;

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class AIPredictionPackage {
  @Prop({ required: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop({ required: true, default: 0 })
  price!: number; // cash/money price

  @Prop({ required: true, default: 30 })
  durationDays!: number; // subscription duration in days

  @Prop({ default: 80 })
  accuracyRate!: number; // represented accuracy percentage

  @Prop({ required: true, default: 'ACTIVE' })
  status!: 'ACTIVE' | 'INACTIVE';
}

export const AIPredictionPackageSchema = SchemaFactory.createForClass(AIPredictionPackage);
