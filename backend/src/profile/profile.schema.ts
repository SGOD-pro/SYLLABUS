import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/user.schema';

@Schema({ versionKey: false })
export class StudyProfile {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  dailyMinutes: number;

  @Prop({ type: [String] })
  preferredSlots?: string[];

  @Prop({ required: true })
  fatigueThreshold: number;

  @Prop({ default: false })
  panicMode: boolean;
}

export type StudyProfileDocument = StudyProfile & Document;

export const StudyProfileSchema = SchemaFactory.createForClass(StudyProfile);
