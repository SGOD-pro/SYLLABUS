import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { Subject } from 'src/subjects/subject.schema';

@Schema({ versionKey: false })
export class Concept {
  @Prop({ type: Types.ObjectId, ref: Subject.name, required: true })
  subjectId: Types.ObjectId;

  @Prop({ required: true })
  name: string;

  // @Prop({required: true,unique:true,index:true})
  // email:string
  
  @Prop({ required: true, min: 1, max: 5 })
  difficulty: number;

  @Prop({ required: true })
  estimatedMinutes: number;

  @Prop({ type: [Types.ObjectId], ref: 'concepts', default: [] })
  prerequisites: Types.ObjectId[];

  @Prop({ default: false })
  systemDefined: boolean;
}

export type ConceptDocument = Concept & Document;

export const ConceptSchema = SchemaFactory.createForClass(Concept);
