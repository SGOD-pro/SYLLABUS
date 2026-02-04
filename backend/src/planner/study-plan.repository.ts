import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { StudyPlan, type StudyPlanDocument } from './study-plan.schema';

export interface CreateStudyPlanInput {
  userId: string;
  date: string;
  sessions: any[];
}

@Injectable()
export class StudyPlanRepository {
  constructor(
    @InjectModel(StudyPlan.name)
    private readonly studyPlanModel: Model<StudyPlanDocument>,
  ) {}

  async findByUserIdAndDate(
    userId: string,
    date: string,
  ): Promise<StudyPlanDocument | null> {
    return this.studyPlanModel.findOne({ userId, date }).exec();
  }

  async create(input: CreateStudyPlanInput): Promise<StudyPlanDocument> {
    return this.studyPlanModel.create(input);
  }

  async deleteByUserIdAndDate(userId: string, date: string): Promise<void> {
    await this.studyPlanModel.deleteOne({ userId, date }).exec();
  }
}
