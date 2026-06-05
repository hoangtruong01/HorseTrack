import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import {
  TrackCondition,
  WeatherCondition,
  RaceType,
} from '../../common/enums/race.enums';

export type AIRaceArrangementSuggestionDocument = AIRaceArrangementSuggestion &
  Document;

export enum ArrangementStatus {
  PENDING = 'PENDING',
  APPLIED = 'APPLIED',
  REJECTED = 'REJECTED',
}

@Schema({ _id: false })
export class RaceEntry {
  @Prop({ type: Types.ObjectId, ref: 'Horse', required: true })
  horseId!: Types.ObjectId;

  @Prop({ required: true })
  strengthScore!: number;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  jockeyUserId?: Types.ObjectId;
}

export const RaceEntrySchema = SchemaFactory.createForClass(RaceEntry);

@Schema({ _id: false })
export class FairnessReport {
  @Prop({ type: [Number], default: [] })
  avgStrengthPerRace!: number[];

  @Prop({ type: [Number], default: [] })
  strengthSpreadPerRace!: number[];

  @Prop({ type: [String], default: [] })
  violations!: string[];
}

export const FairnessReportSchema =
  SchemaFactory.createForClass(FairnessReport);

@Schema({ _id: false })
export class ProposedRaceInfo {
  @Prop({ type: [RaceEntrySchema], required: true, default: [] })
  entries!: RaceEntry[];

  @Prop({ required: true, enum: RaceType, default: RaceType.NORMAL })
  raceType!: RaceType;

  @Prop({ required: true, min: 100 })
  distanceMeters!: number;

  @Prop({ required: true, min: 2 })
  maxParticipants!: number;

  @Prop({ required: true })
  startTime!: Date;

  @Prop({ required: true, enum: TrackCondition, default: TrackCondition.GOOD })
  trackCondition!: TrackCondition;

  @Prop({
    required: true,
    enum: WeatherCondition,
    default: WeatherCondition.SUNNY,
  })
  weather!: WeatherCondition;

  @Prop({ required: true, default: 0 })
  avgStrength!: number;

  @Prop({ required: true, default: 0 })
  strengthSpread!: number;
}

export const ProposedRaceInfoSchema =
  SchemaFactory.createForClass(ProposedRaceInfo);

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class AIRaceArrangementSuggestion {
  @Prop({
    type: Types.ObjectId,
    ref: 'Tournament',
    required: true,
    index: true,
  })
  tournamentId!: Types.ObjectId;

  @Prop({ type: [ProposedRaceInfoSchema], required: true, default: [] })
  proposedRaces!: ProposedRaceInfo[];

  @Prop({ type: FairnessReportSchema })
  fairnessReport?: FairnessReport;

  @Prop()
  reasoning?: string;

  @Prop({
    required: true,
    enum: ArrangementStatus,
    default: ArrangementStatus.PENDING,
  })
  status!: ArrangementStatus;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Race' }], default: [] })
  createdRaceIds!: Types.ObjectId[];
}

export const AIRaceArrangementSuggestionSchema = SchemaFactory.createForClass(
  AIRaceArrangementSuggestion,
);
