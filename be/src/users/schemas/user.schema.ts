import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  BANNED = 'banned',
  DELETED = 'deleted',
}

export enum RoleName {
  ADMIN = 'admin',
  OWNER = 'owner',
  JOCKEY = 'jockey',
  REFEREE = 'referee',
  SPECTATOR = 'spectator',
}

@Schema({ timestamps: true, toObject: { virtuals: true } })
export class User {
  @Prop({ required: true })
  fullName!: string;

  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true, select: false })
  passwordHash!: string;

  @Prop()
  phone?: string;

  @Prop()
  address?: string;

  @Prop()
  dob?: Date;

  @Prop()
  avatar?: string;

  @Prop({ required: true, enum: UserStatus, default: UserStatus.ACTIVE })
  status!: UserStatus;

  @Prop({ type: [String], enum: RoleName, default: [RoleName.SPECTATOR] })
  roles!: RoleName[];

  @Prop()
  deletedAt?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
