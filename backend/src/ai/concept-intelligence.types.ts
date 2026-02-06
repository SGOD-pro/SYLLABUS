export type AvgTimePattern = 'HESITATION' | 'GUESSING' | 'NEUTRAL';

export type MasteryLevel = 'UNKNOWN' | 'WEAK' | 'BUILDING' | 'SOLID';

export type DecayRisk = 'LOW' | 'MEDIUM' | 'HIGH';

export type PrerequisiteState =
  | 'UNKNOWN'
  | 'WEAK'
  | 'BUILDING'
  | 'SOLID'
  | 'MISSING';

export type PrerequisiteImpactSeverity =
  | 'BLOCKING'
  | 'LIMITING'
  | 'NONE'
  | 'UNCERTAIN';

export interface ConceptSignals {
  accuracy: number;
  attempts: number;
  lastTouchedDaysAgo: number;
  avgTimePattern: AvgTimePattern;
}

export interface ConceptDerived {
  masteryLevel: MasteryLevel;
  decayRisk: DecayRisk;
  confidenceScore: number;
}

export interface ConceptIntelligencePayload {
  conceptId: string;
  signals: ConceptSignals;
  derived: ConceptDerived;
  prerequisites: Record<string, PrerequisiteState>;
}

export interface ConceptIntelligenceResponse {
  masteryReason: string;
  decayRiskReason: string;
  prerequisiteImpact: {
    severity: PrerequisiteImpactSeverity;
    concepts: string[];
  };
  uncertaintyNote: string | null;
}
