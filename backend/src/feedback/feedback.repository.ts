import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ConceptFeedback,
  ConceptFeedbackDocument,
} from './feedback.schema';
import { FeedbackType } from './feedback.types';

export interface CreateFeedbackInput {
  userId: ConceptFeedbackDocument['userId'];
  conceptId: ConceptFeedbackDocument['conceptId'];
  sessionId?: ConceptFeedbackDocument['sessionId'];
  feedbackType: FeedbackType;
  note?: string;
}

@Injectable()
export class FeedbackRepository {
  constructor(
    @InjectModel(ConceptFeedback.name)
    private readonly feedbackModel: Model<ConceptFeedbackDocument>,
  ) {}

  async create(input: CreateFeedbackInput): Promise<ConceptFeedback> {
    return this.feedbackModel.create(input);
  }

  async findByUserConceptSince(
    userId: string,
    conceptId: string,
    since: Date,
  ): Promise<ConceptFeedback[]> {
    return this.feedbackModel
      .find({
        userId: new Types.ObjectId(userId),
        conceptId: new Types.ObjectId(conceptId),
        createdAt: { $gte: since },
      })
      .exec();
  }
}
