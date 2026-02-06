import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
