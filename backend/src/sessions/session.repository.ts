import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Types, type Model } from 'mongoose';
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

  async findByUserId(userId: string){
    return this.sessionModel.find({ userId:new Types.ObjectId(userId) }).exec();
  }

  async create(input: CreateStudySessionInput){
    return this.sessionModel.create(input);
  }

  async countByUserIdAndDate(userId: string, date: string) {
    return this.sessionModel
      .countDocuments({ userId: new Types.ObjectId(userId), date })
      .exec();
  }

  async findByIdAndUser(
    sessionId: string,
    userId: string,
  ) {
    return this.sessionModel
      .findOne({
        _id: new Types.ObjectId(sessionId),
        userId: new Types.ObjectId(userId),
      })
      .exec();
  }
}
