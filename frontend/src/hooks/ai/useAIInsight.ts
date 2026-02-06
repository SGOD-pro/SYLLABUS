import { useCallback, useEffect } from 'react';
import { useAIInsightStore } from '@/store';
import { v4 as uuidv4 } from 'uuid';
import { mockDelay } from '@/hooks/shared/mockDelay';
import { usePanicMode } from '@/hooks/planner/usePanicMode';

// Hook: useAIInsight
// Fetch AI explanations (mocked)
export const useAIInsight = () => {
  const { currentInsight, isThinking, setInsight, setThinking } = useAIInsightStore();
  const { isPanicMode } = usePanicMode();

  const normalInsights = [
    "Moved 'Signals' to today because your 'Maths' session was marked easy yesterday. This builds on your momentum.",
    "Prioritizing 'DBMS Normalization' since your exam is in 5 days. The prerequisite 'ER Model' was completed with 90% confidence.",
    "Scheduling 'OS Deadlocks' now because you rated 'Process Sync' as difficult. Taking it fresh in the morning helps retention.",
    "Added extra time for 'Graph Traversals' based on your previous feedback. Complex topics deserve more attention.",
    "Reordered 'Compiler Design' concepts - you'll cover 'Lexical Analysis' first since it's foundational.",
  ];

  const panicInsights = [
    "PANIC MODE: Focusing only on high-weightage topics. These cover 80% of typical exam questions.",
    "Emergency plan activated. Skipping low-priority concepts. Every minute counts now.",
    "Showing only exam-critical material. Quick revision resources prioritized.",
    "High-weightage filter ON. These topics have the highest marks-to-time ratio.",
  ];

  const fetchInsight = useCallback(async () => {
    setThinking(true);
    await mockDelay(1500);

    const insights = isPanicMode ? panicInsights : normalInsights;
    const randomInsight = insights[Math.floor(Math.random() * insights.length)];

    setInsight({
      id: uuidv4(),
      explanationText: randomInsight,
      date: new Date(),
      isPanicMode,
    });
  }, [isPanicMode, setInsight, setThinking]);

  useEffect(() => {
    fetchInsight();
  }, [isPanicMode]);

  return {
    insight: currentInsight,
    isThinking,
    fetchInsight,
  };
};
