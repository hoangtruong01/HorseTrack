import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AIPredictionSuggestionDocument = AIPredictionSuggestion & Document;

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class AIPredictionSuggestion {
  @Prop({ type: Types.ObjectId, ref: 'Race', required: true, unique: true, index: true })
  raceId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Horse', required: true })
  suggestedWinnerId!: Types.ObjectId;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Horse' }] })
  suggestedPlaceIds!: Types.ObjectId[];

  @Prop()
  reasoning?: string; // AI generated reasoning/commentary

  @Prop({ default: 75 })
  confidenceLevel!: number; // Percentage confidence e.g. 85%
}

export const AIPredictionSuggestionSchema = SchemaFactory.createForClass(AIPredictionSuggestion);
