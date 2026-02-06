import { Injectable, NotFoundException } from '@nestjs/common';
import type { Types } from 'mongoose';
import { SessionRepository } from '../sessions/session.repository';
import { ConceptsService } from '../concepts/concept.service';
import type { ConceptDocument } from '../concepts/concept.schema';
import {
  type AvgTimePattern,
  type ConceptDerived,
  type ConceptIntelligencePayload,
  type ConceptIntelligenceResponse,
  type ConceptSignals,
  type PrerequisiteImpactSeverity,
  type PrerequisiteState,
} from './concept-intelligence.types';
import { FeedbackTrend } from '../feedback/feedback.types';

const DAY_MS = 24 * 60 * 60 * 1000;
const HESITATION_RATIO = 1.2;
const GUESSING_RATIO = 0.7;

@Injectable()
export class ConceptIntelligenceService {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly conceptsService: ConceptsService,
  ) {}

  async assemblePayload(
    conceptId: string,
    userId: Types.ObjectId,
  ): Promise<ConceptIntelligencePayload> {
    const concept = await this.conceptsService.getConceptById(conceptId);
    if (!concept) {
      throw new NotFoundException('Concept not found');
    }

    const sessions = await this.sessionRepo.findByUserId(userId.toString());
    const sessionsByConcept = new Map<string, typeof sessions>();
    for (const session of sessions) {
      const key = session.conceptId.toString();
      if (!sessionsByConcept.has(key)) {
        sessionsByConcept.set(key, []);
      }
      sessionsByConcept.get(key)!.push(session);
    }

    const conceptSessions = sessionsByConcept.get(conceptId) ?? [];
    const signals = this.computeSignals(conceptSessions);
    const derived = this.computeDerived(signals);

    const prerequisites = await this.buildPrerequisiteStates(
      concept,
      sessionsByConcept,
    );

    return {
      conceptId,
      signals,
      derived,
      prerequisites,
    };
  }

  buildExplanation(
    payload: ConceptIntelligencePayload,
  ): ConceptIntelligenceResponse {
    const { signals, derived, prerequisites } = payload;

    const masteryReasonParts =
      signals.attempts < 3
        ? [
            'MasteryLevel is UNKNOWN due to insufficient evidence from fewer than 3 attempts.',
            'Accuracy is not yet reliable.',
          ]
        : [
            `MasteryLevel is ${derived.masteryLevel}.`,
            `Accuracy is ${signals.accuracy} across ${signals.attempts} attempts.`,
            `avgTimePattern is ${signals.avgTimePattern}.`,
            `confidenceScore is ${derived.confidenceScore}.`,
          ];

    const decayRiskReason =
      signals.attempts === 0
        ? `DecayRisk is ${derived.decayRisk} because there is no recorded practice yet.`
        : `DecayRisk is ${derived.decayRisk} with lastTouchedDaysAgo ${signals.lastTouchedDaysAgo}.`;

    const prerequisiteImpact = this.computePrerequisiteImpact(prerequisites);

    const uncertaintyNote = this.buildUncertaintyNote(payload);

    return {
      masteryReason: masteryReasonParts.join(' '),
      decayRiskReason,
      prerequisiteImpact,
      uncertaintyNote,
    };
  }

  buildExplanationWithFeedback(
    payload: ConceptIntelligencePayload,
    trend: FeedbackTrend,
  ): ConceptIntelligenceResponse {
    const base = this.buildExplanation(payload);
    const feedbackSentence = this.getFeedbackSentence(trend);
    if (!feedbackSentence) {
      return base;
    }

    return {
      ...base,
      masteryReason: `${base.masteryReason} ${feedbackSentence}`,
    };
  }

  private computeSignals(sessions: any[]): ConceptSignals {
    const attempts = sessions.length;
    let accuracy = 0;
    // Sentinel for no interaction recorded
    let lastTouchedDaysAgo = 9999;
    let avgTimePattern: AvgTimePattern = 'NEUTRAL';

    if (attempts > 0) {
      let total = 0;
      for (const session of sessions) {
        const score = Number(session.completionScore ?? 0);
        const normalized = score > 1 ? score / 100 : score;
        total += Math.max(0, Math.min(1, normalized));
      }
      accuracy = Math.round((total / attempts) * 100);

      const lastDate = sessions
        .map((s) => new Date(s.date))
        .reduce((latest, current) =>
          current > latest ? current : latest,
        );
      const diffMs = Date.now() - lastDate.getTime();
      lastTouchedDaysAgo = Math.max(0, Math.floor(diffMs / DAY_MS));

      const avgPlanned =
        sessions.reduce((sum, s) => sum + (s.plannedMinutes ?? 0), 0) /
        attempts;
      const avgActual =
        sessions.reduce((sum, s) => sum + (s.actualMinutes ?? 0), 0) /
        attempts;
      if (avgPlanned > 0) {
        const ratio = avgActual / avgPlanned;
        if (ratio >= HESITATION_RATIO) {
          avgTimePattern = 'HESITATION';
        } else if (ratio <= GUESSING_RATIO) {
          avgTimePattern = 'GUESSING';
        }
      }
    }

    return {
      accuracy,
      attempts,
      lastTouchedDaysAgo,
      avgTimePattern,
    };
  }

  private computeDerived(signals: ConceptSignals): ConceptDerived {
    const { accuracy, attempts, lastTouchedDaysAgo } = signals;

    let masteryLevel: ConceptDerived['masteryLevel'] = 'UNKNOWN';
    if (attempts > 0) {
      if (accuracy < 50) {
        masteryLevel = 'WEAK';
      } else if (accuracy < 75) {
        masteryLevel = 'BUILDING';
      } else {
        masteryLevel = 'SOLID';
      }
    }

    let decayRisk: ConceptDerived['decayRisk'] = 'HIGH';
    if (lastTouchedDaysAgo <= 7) {
      decayRisk = 'LOW';
    } else if (lastTouchedDaysAgo <= 14) {
      decayRisk = 'MEDIUM';
    }

    return {
      masteryLevel,
      decayRisk,
      confidenceScore: accuracy,
    };
  }

  private async buildPrerequisiteStates(
    concept: ConceptDocument,
    sessionsByConcept: Map<string, any[]>,
  ): Promise<Record<string, PrerequisiteState>> {
    const prerequisites: Record<string, PrerequisiteState> = {};
    const ids = (concept.prerequisites ?? []).map((id) => id.toString());
    if (ids.length === 0) {
      return prerequisites;
    }

    const prereqConcepts = await this.conceptsService.getConceptsByIds(ids);
    const prereqById = new Map(
      prereqConcepts.map((prereq) => [prereq._id.toString(), prereq]),
    );

    for (const id of ids) {
      const exists = prereqById.get(id);
      if (!exists) {
        prerequisites[id] = 'MISSING';
        continue;
      }
      const sessions = sessionsByConcept.get(id) ?? [];
      if (sessions.length === 0) {
        prerequisites[id] = 'MISSING';
        continue;
      }
      const signals = this.computeSignals(sessions);
      const derived = this.computeDerived(signals);
      prerequisites[id] = derived.masteryLevel;
    }

    return prerequisites;
  }

  private computePrerequisiteImpact(
    prerequisites: Record<string, PrerequisiteState>,
  ): ConceptIntelligenceResponse['prerequisiteImpact'] {
    const entries = Object.entries(prerequisites);
    if (entries.length === 0) {
      return { severity: 'NONE', concepts: [] };
    }

    const concepts = entries
      .filter(([, state]) => state !== 'SOLID')
      .map(([conceptId]) => conceptId);

    let severity: PrerequisiteImpactSeverity = 'NONE';
    for (const [, state] of entries) {
      const mapped = this.mapPrerequisiteSeverity(state);
      if (this.isHigherSeverity(mapped, severity)) {
        severity = mapped;
      }
    }

    return { severity, concepts };
  }

  private mapPrerequisiteSeverity(
    state: PrerequisiteState,
  ): PrerequisiteImpactSeverity {
    switch (state) {
      case 'WEAK':
        return 'BLOCKING';
      case 'BUILDING':
        return 'LIMITING';
      case 'SOLID':
        return 'NONE';
      case 'UNKNOWN':
      case 'MISSING':
        return 'UNCERTAIN';
    }
  }

  private isHigherSeverity(
    candidate: PrerequisiteImpactSeverity,
    current: PrerequisiteImpactSeverity,
  ): boolean {
    const order: PrerequisiteImpactSeverity[] = [
      'NONE',
      'UNCERTAIN',
      'LIMITING',
      'BLOCKING',
    ];
    return order.indexOf(candidate) > order.indexOf(current);
  }

  private buildUncertaintyNote(
    payload: ConceptIntelligencePayload,
  ): string | null {
    const reasons: string[] = [];
    const { signals, derived, prerequisites } = payload;

    if (signals.attempts < 3) {
      reasons.push(`Attempts are below 3 (${signals.attempts}).`);
    }

    if (signals.accuracy >= 70 && signals.attempts < 5) {
      reasons.push(
        `High accuracy ${signals.accuracy} with fewer than 5 attempts.`,
      );
    }

    if (signals.accuracy >= 70 && signals.avgTimePattern === 'GUESSING') {
      reasons.push(
        `Accuracy ${signals.accuracy} conflicts with avgTimePattern GUESSING.`,
      );
    }

    if (signals.accuracy < 50 && signals.avgTimePattern === 'HESITATION') {
      reasons.push(
        `Accuracy ${signals.accuracy} conflicts with avgTimePattern HESITATION.`,
      );
    }

    if (signals.lastTouchedDaysAgo <= 7 && derived.decayRisk !== 'LOW') {
      reasons.push(
        `Recent activity (${signals.lastTouchedDaysAgo} days) with decayRisk ${derived.decayRisk}.`,
      );
    }

    const prereqAmbiguity =
      (derived.masteryLevel === 'BUILDING' || derived.masteryLevel === 'SOLID') &&
      Object.values(prerequisites).some(
        (state) => state === 'UNKNOWN' || state === 'MISSING',
      );
    if (prereqAmbiguity) {
      reasons.push(
        `Prerequisite state includes UNKNOWN or MISSING while masteryLevel is ${derived.masteryLevel}.`,
      );
    }

    if (reasons.length === 0) {
      return null;
    }

    return reasons.join(' ');
  }

  private getFeedbackSentence(trend: FeedbackTrend): string | null {
    switch (trend) {
      case 'POSITIVE':
        return 'Recent feedback suggests this concept feels clear and manageable.';
      case 'NEGATIVE':
        return 'Recent feedback indicates this concept has felt confusing or rushed.';
      case 'MIXED':
        return 'Recent feedback on this concept has been mixed.';
      case 'INSUFFICIENT':
        return null;
    }
  }
}
