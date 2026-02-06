import { create } from 'zustand';

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
