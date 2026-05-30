import { Schema } from 'mongoose';

export function mongooseTransformPlugin(schema: Schema): void {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc: unknown, ret: Record<string, unknown>) => {
      ret.id = (ret._id as { toString(): string } | undefined)?.toString();
      delete ret._id;
      delete ret.__v;
      return ret;
    },
  });
}
