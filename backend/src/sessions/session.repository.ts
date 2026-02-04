import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { Model } from 'mongoose';
import { StudySession, type StudySessionDocument } from './session.schema';

export interface CreateStudySessionInput {
  userId: StudySessionDocument['userId'];
  conceptId: StudySessionDocument['conceptId'];
  plannedMinutes: number;
  actualMinutes: number;
  completionScore: number;
  difficultyFeedback: number;
  date: string;
}

@Injectable()
export class SessionRepository {
  constructor(
    @InjectModel(StudySession.name)
    private readonly sessionModel: Model<StudySessionDocument>,
  ) {}

  async findByUserId(userId: string): Promise<StudySession[]> {
    return this.sessionModel.find({ userId }).exec();
  }

  async create(input: CreateStudySessionInput): Promise<StudySession> {
    return this.sessionModel.create(input);
  }
}
