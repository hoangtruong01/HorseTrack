import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type TournamentDocument = Tournament & Document;

export enum TournamentStatus {
  DRAFT = 'DRAFT',
  OPEN_REGISTRATION = 'OPEN_REGISTRATION',
  CLOSED_REGISTRATION = 'CLOSED_REGISTRATION',
  ONGOING = 'ONGOING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

/** Valid status transitions */
export const TOURNAMENT_STATUS_FLOW: Record<TournamentStatus, TournamentStatus[]> = {
  [TournamentStatus.DRAFT]: [TournamentStatus.OPEN_REGISTRATION, TournamentStatus.CANCELLED],
  [TournamentStatus.OPEN_REGISTRATION]: [TournamentStatus.CLOSED_REGISTRATION, TournamentStatus.CANCELLED],
  [TournamentStatus.CLOSED_REGISTRATION]: [TournamentStatus.ONGOING, TournamentStatus.CANCELLED],
  [TournamentStatus.ONGOING]: [TournamentStatus.COMPLETED, TournamentStatus.CANCELLED],
  [TournamentStatus.COMPLETED]: [],
  [TournamentStatus.CANCELLED]: [],
};

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class Tournament {
  @Prop({ required: true })
  name!: string;

  @Prop()
  description?: string;

  @Prop()
  location?: string;

  @Prop({ required: true })
  startDate!: Date;

  @Prop({ required: true })
  endDate!: Date;

  @Prop()
  registrationStartDate?: Date;

  @Prop()
  registrationEndDate?: Date;

  @Prop({
    required: true,
    enum: TournamentStatus,
    default: TournamentStatus.DRAFT,
  })
  status!: TournamentStatus;

  @Prop({ default: 20 })
  maxHorses?: number;

  @Prop({ default: 0 })
  prizePool?: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy!: Types.ObjectId;

  @Prop()
  deletedAt?: Date;
}

export const TournamentSchema = SchemaFactory.createForClass(Tournament);

TournamentSchema.index({ status: 1 });
TournamentSchema.index({ startDate: 1 });
