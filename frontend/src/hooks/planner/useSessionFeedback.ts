import { useCallback, useState } from 'react';
import { useStudyPlanStore } from '@/store';
import { mockDelay } from '@/hooks/shared/mockDelay';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api-client';
import { API_ROUTES } from '@/lib/api-routes';

// Hook: useSessionFeedback
// Submit session completion data
export const useSessionFeedback = () => {
  const { completeSession } = useStudyPlanStore();
  const { getToken } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = useCallback(
    async (sessionId: string,conceptId: string, feedback: Omit<SessionFeedback, 'submittedAt'>) => {
      setIsSubmitting(true);
      // await mockDelay(800);
      // const { sessions } = useStudyPlanStore.getState();
      // const session = sessions.find(s => s.id === sessionId);
      // if (!session) {
      //   console.warn('Session not found for feedback submission');
      //   setIsSubmitting(false);
      //   return false;
      // }
      // const conceptId = feedback. ?? sessionId;
      const fullFeedback: SessionFeedback = {
        ...feedback,
        submittedAt: new Date(),
      };

      try {
        await api(API_ROUTES.SESSION.SUBMIT, {
          method: 'POST',
          body: {
            conceptId: conceptId,
            actualMinutes: feedback.actualMinutes,
            completionScore: feedback.completionPercent,
            difficultyFeedback: feedback.difficultyRating,
          },
          getToken,
        });
      } catch (err) {
        console.warn('Failed to submit session feedback', err);
        setIsSubmitting(false);
        return false;
      }

      completeSession(sessionId, fullFeedback);
      setIsSubmitting(false);

      return true;
    },
    [completeSession, getToken]
  );

  return {
    isSubmitting,
    submitFeedback,
  };
};
