// SYLLABUS - Global State Management with Zustand

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
// import { 
//   UserProfile, 
//   Subject, 
//   StudySession, 
//   AIInsight, 
//   OnboardingState,
//   Degree,
//   TimeSlot,
//   Concept
// } from '@/types';

// Onboarding Store
interface OnboardingStore {
  state: OnboardingState;
  setStep: (step: number) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      state: {
        step: 1,
        profile: {},
        isComplete: false,
      },
      setStep: (step) =>
        set((s) => ({ state: { ...s.state, step } })),
      updateProfile: (data) =>
        set((s) => ({
          state: { ...s.state, profile: { ...s.state.profile, ...data } },
        })),
      completeOnboarding: () =>
        set((s) => ({ state: { ...s.state, isComplete: true } })),
      resetOnboarding: () =>
        set({
          state: { step: 1, profile: {}, isComplete: false },
        }),
    }),
    { name: 'syllabus-onboarding' }
  )
);

// User Profile Store
interface UserStore {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  addSubject: (subject: Subject) => void;
  removeSubject: (subjectId: string) => void;
  updateSubject: (subjectId: string, data: Partial<Subject>) => void;
  clearProfile: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => set({ profile }),
      updateProfile: (data) =>
        set((s) => ({
          profile: s.profile ? { ...s.profile, ...data } : null,
        })),
      addSubject: (subject) =>
        set((s) => ({
          profile: s.profile
            ? { ...s.profile, subjects: [...s.profile.subjects, subject] }
            : null,
        })),
      removeSubject: (subjectId) =>
        set((s) => ({
          profile: s.profile
            ? {
                ...s.profile,
                subjects: s.profile.subjects.filter((sub) => sub.id !== subjectId),
              }
            : null,
        })),
      updateSubject: (subjectId, data) =>
        set((s) => ({
          profile: s.profile
            ? {
                ...s.profile,
                subjects: s.profile.subjects.map((sub) =>
                  sub.id === subjectId ? { ...sub, ...data } : sub
                ),
              }
            : null,
        })),
      clearProfile: () => set({ profile: null }),
    }),
    { name: 'syllabus-user' }
  )
);

// Study Plan Store
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

// Panic Mode Store
interface PanicModeStore {
  isPanicMode: boolean;
  togglePanicMode: () => void;
  setPanicMode: (value: boolean) => void;
}

export const usePanicModeStore = create<PanicModeStore>()(
  persist(
    (set) => ({
      isPanicMode: false,
      togglePanicMode: () => set((s) => ({ isPanicMode: !s.isPanicMode })),
      setPanicMode: (value) => set({ isPanicMode: value }),
    }),
    { name: 'syllabus-panic' }
  )
);

// AI Insights Store
interface AIInsightStore {
  currentInsight: AIInsight | null;
  isThinking: boolean;
  setInsight: (insight: AIInsight) => void;
  setThinking: (value: boolean) => void;
  clearInsight: () => void;
}

export const useAIInsightStore = create<AIInsightStore>((set) => ({
  currentInsight: null,
  isThinking: false,
  setInsight: (insight) => set({ currentInsight: insight, isThinking: false }),
  setThinking: (value) => set({ isThinking: value }),
  clearInsight: () => set({ currentInsight: null }),
}));
