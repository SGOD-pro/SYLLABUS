import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false })
export class StudyProfile {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId!: Types.ObjectId;

  @Prop({ required: true })
  dailyMinutes!: number;

  @Prop({ type: [String] })
  preferredSlots?: string[];

  @Prop({ required: true })
  fatigueThreshold!: number;

  @Prop({ default: false })
  panicMode!: boolean;
}

export type StudyProfileDocument = StudyProfile & Document;

export const StudyProfileSchema = SchemaFactory.createForClass(StudyProfile);
