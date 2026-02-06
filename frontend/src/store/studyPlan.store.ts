import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface StudyPlanStore {
  sessions: StudySession[];
  activeSessionId: string | null;
  setSessions: (sessions: StudySession[]) => void;
  setActiveSession: (sessionId: string | null) => void;
  updateSession: (sessionId: string, data: Partial<StudySession>) => void;
  completeSession: (sessionId: string, feedback: StudySession['feedback']) => void;
  skipSession: (sessionId: string) => void;
  clearPlan: () => void;
}

export const useStudyPlanStore = create<StudyPlanStore>()(
  persist(
    (set) => ({
      sessions: [],
      activeSessionId: null,
      setSessions: (sessions) => set({ sessions }),
      setActiveSession: (sessionId) => set({ activeSessionId: sessionId }),
      updateSession: (sessionId, data) =>
        set((s) => ({
          sessions: s.sessions.map((session) =>
            session.id === sessionId ? { ...session, ...data } : session
          ),
        })),
      completeSession: (sessionId, feedback) =>
        set((s) => ({
          sessions: s.sessions.map((session) =>
            session.id === sessionId
              ? { ...session, status: 'completed', feedback, completedAt: new Date() }
              : session
          ),
        })),
      skipSession: (sessionId) =>
        set((s) => ({
          sessions: s.sessions.map((session) =>
            session.id === sessionId ? { ...session, status: 'skipped' } : session
          ),
        })),
      clearPlan: () => set({ sessions: [], activeSessionId: null }),
    }),
    { name: 'syllabus-plan' }
  )
);
