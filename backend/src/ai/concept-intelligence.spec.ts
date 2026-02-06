import { ConceptIntelligenceService } from './concept-intelligence.service';
import type { ConceptIntelligencePayload } from './concept-intelligence.types';

const service = new ConceptIntelligenceService({} as any, {} as any);

const basePayload: ConceptIntelligencePayload = {
  conceptId: 'concept-1',
  signals: {
    accuracy: 60,
    attempts: 5,
    lastTouchedDaysAgo: 20,
    avgTimePattern: 'NEUTRAL',
  },
  derived: {
    masteryLevel: 'BUILDING',
    decayRisk: 'HIGH',
    confidenceScore: 60,
  },
  prerequisites: {},
};

describe('ConceptIntelligenceService.buildExplanation', () => {
  it('computes prerequisite impact severity and concepts list', () => {
    const payload: ConceptIntelligencePayload = {
      ...basePayload,
      prerequisites: {
        prereqA: 'WEAK',
        prereqB: 'SOLID',
      },
    };

    const res = service.buildExplanation(payload);
    expect(res.prerequisiteImpact.severity).toBe('BLOCKING');
    expect(res.prerequisiteImpact.concepts).toEqual(['prereqA']);
  });

  it('sets uncertaintyNote when attempts < 3', () => {
    const payload: ConceptIntelligencePayload = {
      ...basePayload,
      signals: {
        ...basePayload.signals,
        attempts: 2,
        accuracy: 80,
      },
    };

    const res = service.buildExplanation(payload);
    expect(res.uncertaintyNote).toContain('Attempts are below 3');
    expect(res.masteryReason).toContain('insufficient evidence');
    expect(res.masteryReason).not.toContain('Accuracy is 80');
  });

  it('sets uncertaintyNote for accuracy-time contradiction', () => {
    const payload: ConceptIntelligencePayload = {
      ...basePayload,
      signals: {
        accuracy: 80,
        attempts: 5,
        lastTouchedDaysAgo: 20,
        avgTimePattern: 'GUESSING',
      },
      derived: {
        masteryLevel: 'SOLID',
        decayRisk: 'HIGH',
        confidenceScore: 80,
      },
    };

    const res = service.buildExplanation(payload);
    expect(res.uncertaintyNote).toContain('avgTimePattern GUESSING');
  });

  it('returns null uncertaintyNote when no conflicts and attempts >= 3', () => {
    const res = service.buildExplanation(basePayload);
    expect(res.uncertaintyNote).toBeNull();
  });

  it('uses no recorded practice language when attempts = 0', () => {
    const payload: ConceptIntelligencePayload = {
      ...basePayload,
      signals: {
        accuracy: 0,
        attempts: 0,
        lastTouchedDaysAgo: 9999,
        avgTimePattern: 'NEUTRAL',
      },
      derived: {
        masteryLevel: 'UNKNOWN',
        decayRisk: 'HIGH',
        confidenceScore: 0,
      },
    };

    const res = service.buildExplanation(payload);
    expect(res.decayRiskReason).toContain('no recorded practice yet');
    expect(res.decayRiskReason).not.toContain('lastTouchedDaysAgo');
  });

  it('does not change explanation when feedback is INSUFFICIENT', () => {
    const base = service.buildExplanation(basePayload);
    const withFeedback = service.buildExplanationWithFeedback(
      basePayload,
      'INSUFFICIENT',
    );
    expect(withFeedback).toEqual(base);
  });

  it('appends feedback sentence to masteryReason for POSITIVE trend', () => {
    const res = service.buildExplanationWithFeedback(basePayload, 'POSITIVE');
    expect(res.masteryReason).toContain(
      'Recent feedback suggests this concept feels clear and manageable.',
    );
  });
});
