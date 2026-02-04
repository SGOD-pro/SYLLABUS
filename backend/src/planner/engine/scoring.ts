export interface Subject {
  id: string;
  examDate: string;
  isBacklog: boolean;
  priorityWeight: number;
}

export interface Concept {
  id: string;
  subjectId: string;
  difficulty: number;
  estimatedMinutes: number;
  prerequisites: string[];
}

export interface StudySession {
  conceptId: string;
  completionScore: number;
  difficultyFeedback: number;
}

export function scoreConcept(
  concept: Concept,
  subject: Subject,
  sessions: StudySession[],
  prereqCount: number,
  today: string,
  weights: { w1: number; w2: number },
): number {
  const dayMs = 24 * 60 * 60 * 1000;
  const todayDate = new Date(today);
  const examDate = new Date(subject.examDate);
  const diffMs = examDate.getTime() - todayDate.getTime();
  const daysUntilExam = Math.max(1, Math.ceil(diffMs / dayMs));

  const priorityScore =
    ((weights.w1 * concept.difficulty +
      weights.w2 * (subject.isBacklog ? 1 : 0)) /
      daysUntilExam) *
    subject.priorityWeight;

  const relatedSessions = sessions.filter(
    (session) => session.conceptId === concept.id,
  );

  let weaknessScore = 0;
  if (relatedSessions.length > 0) {
    const avgCompletion =
      relatedSessions.reduce((sum, s) => sum + s.completionScore, 0) /
      relatedSessions.length;
    let normalized = avgCompletion;
    if (normalized > 1) {
      normalized = normalized / 100;
    }
    normalized = Math.max(0, Math.min(1, normalized));
    weaknessScore = 1 - normalized;
  }

  const prerequisiteImportance = prereqCount * 0.5;

  return priorityScore + weaknessScore + prerequisiteImportance;
}
