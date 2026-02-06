import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
// import { FeedbackType } from './feedback.types';
import { User } from 'src/users/user.schema';
import { Concept } from 'src/concepts/concept.schema';
import { StudySession } from 'src/sessions/session.schema';

export enum FeedbackType {
  CONFUSING = 'CONFUSING',
  TOO_FAST = 'TOO_FAST',
  TOO_EASY = 'TOO_EASY',
  NEED_MORE_PRACTICE = 'NEED_MORE_PRACTICE',
  CLEAR = 'CLEAR',
  CONFIDENT = 'CONFIDENT',
}

@Schema({ versionKey: false })
export class ConceptFeedback {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: Concept.name, required: true, index: true })
  conceptId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: StudySession.name, index: true })
  sessionId?: Types.ObjectId;

  @Prop({required: true, enum: FeedbackType, type: String})
  feedbackType: FeedbackType;

  @Prop({ maxlength: 300 })
  note?: string;

  @Prop({ default: Date.now, immutable: true })
  createdAt: Date;
}

export type ConceptFeedbackDocument = ConceptFeedback & Document;

export const ConceptFeedbackSchema =
  SchemaFactory.createForClass(ConceptFeedback);

ConceptFeedbackSchema.index({ userId: 1, conceptId: 1, createdAt: -1 });
