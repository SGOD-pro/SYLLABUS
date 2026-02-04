import { Annotation } from "@langchain/langgraph";

export const ExplainabilityStateAnnotation = Annotation.Root({
  // -------- Raw Input --------
  yesterdayPlan: Annotation<any | null>(),
  todayPlan: Annotation<any>(),
  profile: Annotation<{
    dailyMinutes: number;
    panicMode: boolean;
  }>(),
  recentSessions: Annotation<
    {
      conceptId: string;
      completionScore: number;
      difficultyFeedback: number;
    }[]
  >(),

  // -------- Derived --------
  planDiff: Annotation<{
    added: string[];
    removed: string[];
    orderChanges: { conceptId: string; from: number; to: number }[];
    timeChanges: { conceptId: string; from: number; to: number }[];
  }>(),

  learningSignals: Annotation<{
    weakConcepts: string[];
    difficultConcepts: string[];
    backlogInfluence: boolean;
  }>(),

  // -------- Output --------
  explanationText: Annotation<string>(),
});

export type ExplainabilityState =
  typeof ExplainabilityStateAnnotation.State;
