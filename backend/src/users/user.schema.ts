import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ versionKey: false })
export class User {
  @Prop({ required: true, unique: true, index: true })
  clerkId: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;
  
  @Prop()
  name: string;

  @Prop()
  degree?: string;

  @Prop()
  semester?: number;

  @Prop({ default: null })
  profilePic?: string;
}

export type UserDocument = User & Document;

export const UserSchema = SchemaFactory.createForClass(User);
