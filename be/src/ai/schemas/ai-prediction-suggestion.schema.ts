import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AIPredictionSuggestionDocument = AIPredictionSuggestion & Document;

export enum PredictionSource {
  MANUAL = 'MANUAL',
  RULE_BASED = 'RULE_BASED',
  LLM = 'LLM',
}

@Schema({ _id: false })
export class HorseRanking {
  @Prop({ type: Types.ObjectId, ref: 'Horse', required: true })
  horseId!: Types.ObjectId;

  @Prop({ required: true })
  predictedRank!: number;

  @Prop({ required: true, min: 0, max: 1 })
  winProbability!: number;

  @Prop({ required: true })
  strengthScore!: number;
}

export const HorseRankingSchema = SchemaFactory.createForClass(HorseRanking);

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class AIPredictionSuggestion {
  @Prop({
    type: Types.ObjectId,
    ref: 'Race',
    required: true,
    unique: true,
    index: true,
  })
  raceId!: Types.ObjectId;

  @Prop({ type: [HorseRankingSchema], required: true, default: [] })
  rankings!: HorseRanking[];

  @Prop({
    required: true,
    enum: PredictionSource,
    default: PredictionSource.RULE_BASED,
  })
  source!: PredictionSource;

  @Prop({ required: true, min: 0, max: 100, default: 50 })
  confidenceLevel!: number;

  @Prop()
  reasoning?: string;

  @Prop({ required: true, default: () => new Date() })
  generatedAt!: Date;
}

export const AIPredictionSuggestionSchema = SchemaFactory.createForClass(
  AIPredictionSuggestion,
);
