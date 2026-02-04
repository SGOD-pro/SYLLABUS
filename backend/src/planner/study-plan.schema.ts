import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ versionKey: false })
export class StudyPlan {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  userId!: Types.ObjectId;

  @Prop({ required: true, index: true })
  date!: string;

  @Prop({
    type: [
      {
        conceptId: { type: Types.ObjectId, ref: 'Concept', required: true },
        plannedMinutes: { type: Number, required: true },
        order: { type: Number, required: true },
      },
    ],
    required: true,
  })
  sessions!: { conceptId: Types.ObjectId; plannedMinutes: number; order: number }[];
}

export type StudyPlanDocument = StudyPlan & Document;

export const StudyPlanSchema = SchemaFactory.createForClass(StudyPlan);
