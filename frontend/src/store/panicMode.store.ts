import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
