import { useCallback, useState } from 'react';
import { useStudyPlanStore } from '@/store';
import { v4 as uuidv4 } from 'uuid';
import { mockDelay } from '@/hooks/shared/mockDelay';
import { usePanicMode } from '@/hooks/planner/usePanicMode';
import { useSubjects } from '@/hooks/planner/useSubjects';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api-client';
import { API_ROUTES } from '@/lib/api-routes';

// Hook: useStudyPlan
// Fetches and manages study sessions
export const useStudyPlan = () => {
  const {
    sessions,
    setSessions,
    activeSessionId,
    setActiveSession,
    updateSession,
    completeSession,
    skipSession,
  } = useStudyPlanStore();
  const { isPanicMode } = usePanicMode();
  const { subjects } = useSubjects();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [backendProgress, setBackendProgress] = useState<{
    completedCount: number;
    totalCount: number;
    percent: number;
  } | null>(null);

  const fetchPlan = useCallback(async () => {
    setIsLoading(true);
    // await mockDelay(500);

    let plan: unknown | null = null;

    try {
      plan = await api<unknown>(API_ROUTES.PLANNER.TODAY, { getToken });
    } catch (err) {
      console.warn('[planner] failed to fetch today plan', err);
    }

    const rawSessions = (plan as any)?.sessions;

    if (!plan || !Array.isArray(rawSessions) || rawSessions.length === 0) {
      try {
        await api(API_ROUTES.PLANNER.GENERATE, { method: 'POST', getToken });
        plan = await api<unknown>(API_ROUTES.PLANNER.TODAY, { getToken });
      } catch (err) {
        console.warn('[planner] failed to generate today plan', err);
      }
    }

    const generatedRawSessions = (plan as any)?.sessions;
    const completedRaw = (plan as any)?.completedSessions;
    const completedList = Array.isArray(completedRaw) ? completedRaw : [];

    if (Array.isArray(generatedRawSessions) && generatedRawSessions.length > 0) {
      const explanationsRaw = (plan as any)?.explanations;
      const explanationMap =
        explanationsRaw && typeof explanationsRaw === 'object' ? explanationsRaw : null;

      const completedMap = new Map<string, { completionScore: number; difficultyFeedback: number }>();
      completedList.forEach((entry: any) => {
        const conceptId = entry?.conceptId;
        const completionScore = entry?.completionScore;
        const difficultyFeedback = entry?.difficultyFeedback;
        if (
          typeof conceptId === 'string' &&
          typeof completionScore === 'number' &&
          typeof difficultyFeedback === 'number'
        ) {
          completedMap.set(conceptId, { completionScore, difficultyFeedback });
        }
      });

      const conceptMap = new Map<string, Concept>();
      subjects.forEach((subject) => {
        subject.concepts.forEach((concept) => {
          conceptMap.set(concept.id, concept);
        });
      });

      const enriched = generatedRawSessions
        .map((session: any) => {
          const conceptId = session?.conceptId;
          if (typeof conceptId !== 'string') return null;

          const concept = conceptMap.get(conceptId);
          if (!concept) return null;

          const orderVal = typeof session?.order === 'number' ? session.order : 0;
          const plannedMinutes =
            typeof session?.plannedMinutes === 'number'
              ? session.plannedMinutes
              : concept.estimatedMinutes;

          const completed = completedMap.get(conceptId);

          const explanationEntry = explanationMap
            ? (explanationMap as any)[conceptId]
            : undefined;
          const explanation =
            explanationEntry &&
            typeof explanationEntry.reason === 'string' &&
            (explanationEntry.priority === 'high' ||
              explanationEntry.priority === 'medium' ||
              explanationEntry.priority === 'low')
              ? {
                  reason: explanationEntry.reason,
                  priority: explanationEntry.priority,
                }
              : undefined;

          return {
            id: uuidv4(),
            conceptId,
            concept,
            plannedMinutes,
            order: orderVal,
            status: completed ? ('completed' as const) : ('pending' as const),
            feedback: completed
              ? {
                  completionPercent: completed.completionScore * 100,
                  difficultyRating: completed.difficultyFeedback,
                  submittedAt: new Date(),
                }
              : undefined,
            prerequisitesMet: false,
            explanation,
          } as StudySession & {
            explanation?: { reason: string; priority: 'high' | 'medium' | 'low' };
          };
        })
        .filter(Boolean) as StudySession[];

      const sorted = enriched
        .sort((a, b) => a.order - b.order)
        .map((session, index) => ({
          ...session,
          prerequisitesMet: index < 2 || Math.random() > 0.3, // First 2 always unlocked
        }));

      if (sorted.length > 0) {
        const progress = (plan as any)?.progress;
        const completedCount = progress?.completedCount;
        const totalCount = progress?.totalCount;
        const percent = progress?.percent;

        if (
          typeof completedCount === 'number' &&
          Number.isFinite(completedCount) &&
          typeof totalCount === 'number' &&
          Number.isFinite(totalCount) &&
          typeof percent === 'number' &&
          Number.isFinite(percent)
        ) {
          setBackendProgress({ completedCount, totalCount, percent });
        } else {
          setBackendProgress(null);
        }

        setSessions(sorted);
        setIsLoading(false);
        return;
      }
    }

    setSessions([]);
    setIsLoading(false);
  }, [setSessions, getToken, subjects]);

  const recalculatePlan = useCallback(async () => {
    setIsRecalculating(true);
    await mockDelay(1500); // Longer delay to show recalculating animation

    try {
      await api(API_ROUTES.PLANNER.GENERATE, { method: 'POST', getToken });
    } catch (err) {
      console.warn('[planner] failed to generate today plan', err);
    }

    await fetchPlan();
    setIsRecalculating(false);
  }, [fetchPlan, getToken]);

  // Filter sessions based on panic mode
  const filteredSessions = isPanicMode
    ? sessions.filter((s) => s.concept.isHighWeight)
    : sessions;

  const resolvedCompletedCount = backendProgress?.completedCount ?? 0;
  const resolvedTotalCount = backendProgress?.totalCount ?? 0;
  const resolvedProgressPercent = backendProgress?.percent ?? 0;

  return {
    sessions: filteredSessions,
    allSessions: sessions,
    isLoading,
    isRecalculating,
    activeSessionId,
    completedCount: resolvedCompletedCount,
    totalCount: resolvedTotalCount,
    progressPercent: resolvedProgressPercent,
    fetchPlan,
    recalculatePlan,
    setActiveSession,
    updateSession,
    completeSession,
    skipSession,
  };
};
