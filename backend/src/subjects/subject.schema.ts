import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/users/user.schema';

@Schema({ versionKey: false })
export class Subject {
  @Prop({ type: Types.ObjectId, ref: User.name, required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  examDate: Date;

  @Prop({ default: false })
  isBacklog: boolean;

  @Prop({ default: 1 })
  priorityWeight: number;

  @Prop({ default: false })
  systemDefined: boolean;
}

export type SubjectDocument = Subject & Document;

export const SubjectSchema = SchemaFactory.createForClass(Subject);
