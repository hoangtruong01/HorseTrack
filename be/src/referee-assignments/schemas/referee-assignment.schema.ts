import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type RefereeAssignmentDocument = RefereeAssignment & Document;

export enum RefereeRole {
  MAIN = 'main',
  ASSISTANT = 'assistant',
}

export enum RefereeAssignmentStatus {
  ASSIGNED = 'assigned',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  REMOVED = 'removed',
}

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class RefereeAssignment {
  @Prop({ type: Types.ObjectId, ref: 'Race', required: true })
  raceId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  refereeUserId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  assignedBy!: Types.ObjectId;

  @Prop({ required: true, enum: RefereeRole, default: RefereeRole.MAIN })
  role!: RefereeRole;

  @Prop({
    required: true,
    enum: RefereeAssignmentStatus,
    default: RefereeAssignmentStatus.ASSIGNED,
  })
  status!: RefereeAssignmentStatus;

  @Prop({ default: 0, min: 0 })
  salary!: number;
}

export const RefereeAssignmentSchema =
  SchemaFactory.createForClass(RefereeAssignment);
RefereeAssignmentSchema.index({ raceId: 1 });
RefereeAssignmentSchema.index({ refereeUserId: 1 });
RefereeAssignmentSchema.index({ status: 1 });
RefereeAssignmentSchema.index(
  { raceId: 1, refereeUserId: 1 },
  { unique: true },
);
