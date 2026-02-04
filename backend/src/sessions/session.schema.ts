import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false })
export class StudySession {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Concept', required: true })
  conceptId!: Types.ObjectId;

  @Prop({ required: true })
  plannedMinutes!: number;

  @Prop({ required: true })
  actualMinutes!: number;

  @Prop({ required: true })
  completionScore!: number;

  @Prop({ required: true })
  difficultyFeedback!: number;

  @Prop({ required: true })
  date!: string;
}

export type StudySessionDocument = StudySession & Document;

export const StudySessionSchema = SchemaFactory.createForClass(StudySession);
