import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HorseDocument = Horse & Document;

@Schema()
export class Horse {
  @Prop({ required: true })
  name!: string;

  @Prop()
  breed?: string;

  @Prop()
  age?: number;
}

export const HorseSchema = SchemaFactory.createForClass(Horse);
