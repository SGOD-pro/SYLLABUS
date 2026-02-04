import { exceedsFatigue } from './fatigue';
import { applyPanicMode } from './panic-mode';
import { scoreConcept, type Concept, type Subject, type StudySession } from './scoring';

export interface StudyProfile {
  dailyMinutes: number;
  fatigueThreshold: number;
  panicMode: boolean;
}

export interface StudyPlan {
  date: string;
  sessions: {
    conceptId: string;
    plannedMinutes: number;
    order: number;
  }[];
}

export interface PlannerInput {
  subjects: Subject[];
  concepts: Concept[];
  profile: StudyProfile;
  sessions: StudySession[];
  today: string;
}

interface ScoredConcept {
  concept: Concept;
  score: number;
}

function normalizeCompletionScore(score: number): number {
  let normalized = score;
  if (normalized > 1) {
    normalized = normalized / 100;
  }
  return Math.max(0, Math.min(1, normalized));
}

export function generatePlan(input: PlannerInput): StudyPlan {
  const subjectById = new Map<string, Subject>(
    input.subjects.map((subject) => [subject.id, subject]),
  );
  const conceptById = new Map<string, Concept>(
    input.concepts.map((concept) => [concept.id, concept]),
  );

  const prereqCounts = new Map<string, number>();
  for (const concept of input.concepts) {
    for (const prereqId of concept.prerequisites) {
      prereqCounts.set(prereqId, (prereqCounts.get(prereqId) ?? 0) + 1);
    }
  }

  const completedConceptIds = new Set<string>();
  for (const session of input.sessions) {
    if (normalizeCompletionScore(session.completionScore) >= 1) {
      completedConceptIds.add(session.conceptId);
    }
  }

  const eligibleConcepts = input.concepts.filter((concept) =>
    concept.prerequisites.every(
      (prereqId) =>
        conceptById.has(prereqId) && completedConceptIds.has(prereqId),
    ),
  );

  const overrides = applyPanicMode(input.profile);
  const effectiveFatigueThreshold =
    input.profile.fatigueThreshold * overrides.fatigueMultiplier;

  const scored: ScoredConcept[] = [];
  for (const concept of eligibleConcepts) {
    const subject = subjectById.get(concept.subjectId);
    if (!subject) {
      continue;
    }
    const prereqCount = prereqCounts.get(concept.id) ?? 0;
    const score = scoreConcept(
      concept,
      subject,
      input.sessions,
      prereqCount,
      input.today,
      { w1: overrides.w1, w2: overrides.w2 },
    );
    scored.push({ concept, score });
  }

  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.concept.id.localeCompare(b.concept.id);
  });

  const sessions: StudyPlan['sessions'] = [];
  let remainingMinutes = input.profile.dailyMinutes;
  let order = 1;

  for (const item of scored) {
    if (remainingMinutes <= 0) {
      break;
    }

    const maxByRemaining = Math.min(
      item.concept.estimatedMinutes,
      remainingMinutes,
    );
    if (maxByRemaining <= 0) {
      continue;
    }

    let plannedMinutes = maxByRemaining;
    if (
      exceedsFatigue(
        item.concept.difficulty,
        plannedMinutes,
        effectiveFatigueThreshold,
      )
    ) {
      const maxByFatigue = Math.floor(
        effectiveFatigueThreshold / item.concept.difficulty,
      );
      if (maxByFatigue <= 0) {
        continue;
      }
      plannedMinutes = Math.min(maxByFatigue, remainingMinutes);
    }

    if (plannedMinutes <= 0) {
      continue;
    }

    sessions.push({
      conceptId: item.concept.id,
      plannedMinutes,
      order,
    });
    order += 1;
    remainingMinutes -= plannedMinutes;
  }

  return {
    date: input.today,
    sessions,
  };
}
