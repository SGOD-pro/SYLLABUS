import { BadRequestException } from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { FeedbackType } from './feedback.types';

describe('FeedbackService', () => {
  it('computes POSITIVE trend when score >= 2', async () => {
    const feedbackRepo = {
      findByUserConceptSince: jest.fn().mockResolvedValue([
        { feedbackType: 'CONFIDENT' as FeedbackType },
        { feedbackType: 'CLEAR' as FeedbackType },
      ]),
      create: jest.fn(),
    };
    const sessionRepo = { findByIdAndUser: jest.fn() };
    const service = new FeedbackService(feedbackRepo as any, sessionRepo as any);

    const trend = await service.getTrend({} as any, 'concept-1');
    expect(trend).toBe('POSITIVE');
  });

  it('computes NEGATIVE trend when score <= -2', async () => {
    const feedbackRepo = {
      findByUserConceptSince: jest.fn().mockResolvedValue([
        { feedbackType: 'CONFUSING' as FeedbackType },
        { feedbackType: 'TOO_FAST' as FeedbackType },
      ]),
      create: jest.fn(),
    };
    const sessionRepo = { findByIdAndUser: jest.fn() };
    const service = new FeedbackService(feedbackRepo as any, sessionRepo as any);

    const trend = await service.getTrend({} as any, 'concept-1');
    expect(trend).toBe('NEGATIVE');
  });

  it('computes MIXED trend when score is between -1 and 1', async () => {
    const feedbackRepo = {
      findByUserConceptSince: jest.fn().mockResolvedValue([
        { feedbackType: 'CLEAR' as FeedbackType },
        { feedbackType: 'TOO_FAST' as FeedbackType },
      ]),
      create: jest.fn(),
    };
    const sessionRepo = { findByIdAndUser: jest.fn() };
    const service = new FeedbackService(feedbackRepo as any, sessionRepo as any);

    const trend = await service.getTrend({} as any, 'concept-1');
    expect(trend).toBe('MIXED');
  });

  it('returns INSUFFICIENT when fewer than 2 entries exist', async () => {
    const feedbackRepo = {
      findByUserConceptSince: jest.fn().mockResolvedValue([
        { feedbackType: 'CLEAR' as FeedbackType },
      ]),
      create: jest.fn(),
    };
    const sessionRepo = { findByIdAndUser: jest.fn() };
    const service = new FeedbackService(feedbackRepo as any, sessionRepo as any);

    const trend = await service.getTrend({} as any, 'concept-1');
    expect(trend).toBe('INSUFFICIENT');
  });

  it('rejects sessionId not belonging to user', async () => {
    const feedbackRepo = {
      create: jest.fn(),
      findByUserConceptSince: jest.fn(),
    };
    const sessionRepo = { findByIdAndUser: jest.fn().mockResolvedValue(null) };
    const service = new FeedbackService(feedbackRepo as any, sessionRepo as any);

    await expect(
      service.submitFeedback({} as any, {
        conceptId: '507f1f77bcf86cd799439011',
        feedbackType: 'CLEAR',
        sessionId: '507f1f77bcf86cd799439012',
        note: null,
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(feedbackRepo.create).not.toHaveBeenCalled();
  });
});
