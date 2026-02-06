import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Concept } from 'src/concepts/concept.schema';
import { User } from 'src/users/user.schema';

@Schema({ _id: false })
export class StudyPlanSessions {
  @Prop({ type: Types.ObjectId, ref: Concept.name, required: true })
  conceptId: Types.ObjectId;

  @Prop({ type: Number, required: true })
  plannedMinutes: number;

  @Prop({ type: Number, required: true })
  order: number
}
export const StudyPlanSessionsSchema = SchemaFactory.createForClass(StudyPlanSessions);

@Schema({ versionKey: false })
export class StudyPlan {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, index: true })
  userId: Types.ObjectId;

  @Prop({ required: true, index: true })
  date: string;

  @Prop({ type: [StudyPlanSessionsSchema] })
  sessions: StudyPlanSessions[];
}

export type StudyPlanDocument = StudyPlan & Document;

export const StudyPlanSchema = SchemaFactory.createForClass(StudyPlan);
