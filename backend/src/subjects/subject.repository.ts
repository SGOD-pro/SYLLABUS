import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { Subject, type SubjectDocument } from './subject.schema';

export interface SubjectCreateInput {
  userId: SubjectDocument['userId'];
  name: string;
  examDate: Date;
  isBacklog?: boolean;
  priorityWeight?: number;
}

@Injectable()
export class SubjectsRepository {
  constructor(
    @InjectModel(Subject.name)
    private readonly subjectModel: Model<SubjectDocument>,
  ) {}

  async create(subjectData: SubjectCreateInput): Promise<SubjectDocument> {
    return this.subjectModel.create(subjectData);
  }

  async findByUserId(
    userId: SubjectDocument['userId'],
  ): Promise<SubjectDocument[]> {
    return this.subjectModel.find({ userId }).exec();
  }

  async findByIdAndUser(
    subjectId: SubjectDocument['_id'],
    userId: SubjectDocument['userId'],
  ): Promise<SubjectDocument | null> {
    return this.subjectModel.findOne({ _id: subjectId, userId }).exec();
  }
  
}
