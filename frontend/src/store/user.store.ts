import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
