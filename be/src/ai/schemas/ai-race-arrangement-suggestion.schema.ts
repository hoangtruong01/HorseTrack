import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AIRaceArrangementSuggestionDocument = AIRaceArrangementSuggestion & Document;

@Schema({ _id: false })
export class ProposedRaceInfo {
  @Prop({ required: true })
  name!: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Horse' }] })
  horseIds!: Types.ObjectId[];

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }] })
  refereeIds!: Types.ObjectId[];

  @Prop({ default: 'Good' })
  trackCondition!: string;
}

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class AIRaceArrangementSuggestion {
  @Prop({ type: Types.ObjectId, ref: 'Tournament', required: true, index: true })
  tournamentId!: Types.ObjectId;

  @Prop({ type: [ProposedRaceInfo], required: true })
  proposedRaces!: ProposedRaceInfo[];

  @Prop()
  reasoning?: string; // why the AI generated this pairing/referee assignment

  @Prop({ required: true, default: 'PENDING' })
  status!: 'PENDING' | 'APPLIED' | 'REJECTED';
}

export const AIRaceArrangementSuggestionSchema = SchemaFactory.createForClass(
  AIRaceArrangementSuggestion,
);
