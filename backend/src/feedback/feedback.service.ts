import { BadRequestException, Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { SessionRepository } from '../sessions/session.repository';
import { FeedbackRepository } from './feedback.repository';
import { ConceptFeedbackRequestDto } from './feedback.dto';
import { FeedbackTrend, FeedbackType } from './feedback.types';

const FEEDBACK_WINDOW_DAYS = 30;

const FEEDBACK_WEIGHTS: Record<FeedbackType, number> = {
  CONFUSING: -2,
  TOO_FAST: -1,
  NEED_MORE_PRACTICE: -1,
  CLEAR: 1,
  CONFIDENT: 2,
  TOO_EASY: 1,
};

@Injectable()
export class FeedbackService {
  constructor(
    private readonly feedbackRepo: FeedbackRepository,
    private readonly sessionRepo: SessionRepository,
  ) {}

  async submitFeedback(userId: Types.ObjectId, dto: ConceptFeedbackRequestDto) {
    if (dto.sessionId) {
      const session = await this.sessionRepo.findByIdAndUser(
        dto.sessionId,
        userId.toString(),
      );
      if (!session) {
        throw new BadRequestException('Invalid sessionId for user');
      }
    }

    await this.feedbackRepo.create({
      userId,
      conceptId: new Types.ObjectId(dto.conceptId),
      sessionId: dto.sessionId ? new Types.ObjectId(dto.sessionId) : undefined,
      feedbackType: dto.feedbackType,
      note: dto.note ?? undefined,
    });
  }

  async getTrend(
    userId: Types.ObjectId,
    conceptId: string,
    sinceDate?: Date,
  ): Promise<FeedbackTrend> {
    const since =
      sinceDate ??
      new Date(Date.now() - FEEDBACK_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const entries = await this.feedbackRepo.findByUserConceptSince(
      userId.toString(),
      conceptId,
      since,
    );

    if (entries.length < 2) {
      return 'INSUFFICIENT';
    }

    const trendScore = entries.reduce((sum, entry) => {
      return sum + (FEEDBACK_WEIGHTS[entry.feedbackType] ?? 0);
    }, 0);

    if (trendScore >= 2) {
      return 'POSITIVE';
    }
    if (trendScore <= -2) {
      return 'NEGATIVE';
    }
    return 'MIXED';
  }
}
