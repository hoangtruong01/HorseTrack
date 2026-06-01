import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AIPredictionPackageDocument = AIPredictionPackage & Document;

export enum PackageStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class AIPredictionPackage {
  @Prop({ required: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop({ required: true, default: 0 })
  price!: number;

  @Prop({ required: true, default: 30 })
  durationDays!: number;

  @Prop({ default: 80 })
  accuracyRate!: number;

  @Prop({ required: true, enum: PackageStatus, default: PackageStatus.ACTIVE })
  status!: PackageStatus;
}

export const AIPredictionPackageSchema =
  SchemaFactory.createForClass(AIPredictionPackage);
