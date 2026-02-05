// SYLLABUS - Custom Hooks for Data Fetching
// Ready for backend integration - currently using mock data

import { useCallback, useEffect, useState } from 'react';
import { 
  useStudyPlanStore, 
  usePanicModeStore, 
  useAIInsightStore,
  useUserStore 
} from '@/store';
// import { 
//   StudySession, 
//   SessionFeedback, 
//   AIInsight, 
//   Resource, 
//   Concept,
//   Subject
// } from '@/types';

import { createSubjectFromTemplate, getSubjectsForDegree } from '@/data/subjects';
import { v4 as uuidv4} from 'uuid';

// Mock delay to simulate API calls
const mockDelay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Hook: useStudyPlan
// Fetches and manages study sessions
export const useStudyPlan = () => {
  const { sessions, setSessions, activeSessionId, setActiveSession, updateSession, completeSession, skipSession } = useStudyPlanStore();
  const { isPanicMode } = usePanicModeStore();
  const { profile } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);

  const generateMockSessions = useCallback((): StudySession[] => {
    if (!profile?.subjects?.length) return [];

    const allConcepts: Array<{ concept: Concept; subject: Subject }> = [];
    
    profile.subjects.forEach((subject) => {
      subject.concepts.forEach((concept) => {
        allConcepts.push({ concept, subject });
      });
    });

    // Shuffle and take some concepts for today
    const shuffled = allConcepts.sort(() => Math.random() - 0.5);
    const todayConcepts = shuffled.slice(0, Math.min(6, shuffled.length));

    return todayConcepts.map((item, index) => ({
      id: uuidv4(),
      conceptId: item.concept.id,
      concept: item.concept,
      plannedMinutes: item.concept.estimatedMinutes,
      order: index + 1,
      status: 'pending' as const,
      prerequisitesMet: index < 2 || Math.random() > 0.3, // First 2 always unlocked
    }));
  }, [profile]);

  const fetchPlan = useCallback(async () => {
    setIsLoading(true);
    await mockDelay(500);
    
    const mockSessions = generateMockSessions();
    setSessions(mockSessions);
    setIsLoading(false);
  }, [generateMockSessions, setSessions]);

  const recalculatePlan = useCallback(async () => {
    setIsRecalculating(true);
    await mockDelay(1500); // Longer delay to show recalculating animation
    
    const mockSessions = generateMockSessions();
    setSessions(mockSessions);
    setIsRecalculating(false);
  }, [generateMockSessions, setSessions]);

  // Filter sessions based on panic mode
  const filteredSessions = isPanicMode
    ? sessions.filter((s) => s.concept.isHighWeight)
    : sessions;

  const completedCount = filteredSessions.filter((s) => s.status === 'completed').length;
  const totalCount = filteredSessions.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return {
    sessions: filteredSessions,
    allSessions: sessions,
    isLoading,
    isRecalculating,
    activeSessionId,
    completedCount,
    totalCount,
    progressPercent,
    fetchPlan,
    recalculatePlan,
    setActiveSession,
    updateSession,
    completeSession,
    skipSession,
  };
};

// Hook: useSubjects
// CRUD operations for subjects
export const useSubjects = () => {
  const { profile, addSubject, removeSubject, updateSubject } = useUserStore();
  const [isLoading, setIsLoading] = useState(false);

  const subjects = profile?.subjects || [];

  const fetchSubjectTemplates = useCallback(() => {
    if (!profile?.degree) return [];
    return getSubjectsForDegree(profile.degree);
  }, [profile?.degree]);

  const addSubjectFromTemplate = useCallback(
    async (templateName: string, examDate: Date, isBacklog: boolean = false) => {
      setIsLoading(true);
      await mockDelay(300);

      const templates = getSubjectsForDegree(profile?.degree || 'B.Tech');
      const template = templates.find((t) => t.name === templateName);

      if (template) {
        const subject = createSubjectFromTemplate(template, examDate);
        subject.isBacklog = isBacklog;
        addSubject(subject);
      }

      setIsLoading(false);
    },
    [profile?.degree, addSubject]
  );

  const addCustomSubject = useCallback(
    async (name: string, examDate: Date, isBacklog: boolean = false) => {
      setIsLoading(true);
      await mockDelay(300);

      const subject: Subject = {
        id: uuidv4(),
        name,
        examDate,
        isBacklog,
        creditWeight: 4,
        concepts: [],
      };

      addSubject(subject);
      setIsLoading(false);
    },
    [addSubject]
  );

  return {
    subjects,
    isLoading,
    fetchSubjectTemplates,
    addSubjectFromTemplate,
    addCustomSubject,
    removeSubject,
    updateSubject,
  };
};

// Hook: useSessionFeedback
// Submit session completion data
export const useSessionFeedback = () => {
  const { completeSession } = useStudyPlanStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitFeedback = useCallback(
    async (sessionId: string, feedback: Omit<SessionFeedback, 'submittedAt'>) => {
      setIsSubmitting(true);
      await mockDelay(800);

      const fullFeedback: SessionFeedback = {
        ...feedback,
        submittedAt: new Date(),
      };

      completeSession(sessionId, fullFeedback);
      setIsSubmitting(false);

      return true;
    },
    [completeSession]
  );

  return {
    isSubmitting,
    submitFeedback,
  };
};

// Hook: usePanicMode
// Toggle and persist panic state
export const usePanicMode = () => {
  const { isPanicMode, togglePanicMode, setPanicMode } = usePanicModeStore();

  // Mock API call for panic toggle
  const togglePanicModeWithAPI = useCallback(async () => {
    // In real app, this would call POST /api/planner/panic-toggle
    togglePanicMode();
    // Mock API response would return { panicMode: true/false }
  }, [togglePanicMode]);

  return {
    isPanicMode,
    togglePanicMode: togglePanicModeWithAPI,
    setPanicMode,
  };
};

// Hook: useAIInsight
// Fetch AI explanations (mocked)
export const useAIInsight = () => {
  const { currentInsight, isThinking, setInsight, setThinking } = useAIInsightStore();
  const { isPanicMode } = usePanicModeStore();

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

// Hook: useResources
// Get learning resources for a topic (mocked)
export const useResources = (conceptName?: string) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isPanicMode } = usePanicModeStore();

  const fetchResources = useCallback(async (topic?: string) => {
    setIsLoading(true);
    await mockDelay(400);

    // Mock resources based on topic
    const mockResources: Resource[] = [
      {
        id: '1',
        title: `${topic || 'Topic'} - NPTEL Lecture`,
        url: 'https://nptel.ac.in',
        platform: 'NPTEL',
        isQuickRevision: false,
      },
      {
        id: '2',
        title: `${topic || 'Topic'} by Abdul Bari`,
        url: 'https://youtube.com/@abdul_bari',
        platform: 'YouTube',
        isQuickRevision: false,
      },
      {
        id: '3',
        title: `${topic || 'Topic'} - Gate Smashers`,
        url: 'https://youtube.com/@GateSmashers',
        platform: 'YouTube',
        isQuickRevision: true,
      },
      {
        id: '4',
        title: `${topic || 'Topic'} Quick Notes PDF`,
        url: '#',
        platform: 'PDF',
        isQuickRevision: true,
      },
    ];

    // In panic mode, prioritize quick revision resources
    const filtered = isPanicMode
      ? mockResources.filter((r) => r.isQuickRevision)
      : mockResources;

    setResources(filtered);
    setIsLoading(false);
  }, [isPanicMode]);

  useEffect(() => {
    if (conceptName) {
      fetchResources(conceptName);
    }
  }, [conceptName, fetchResources]);

  return {
    resources,
    isLoading,
    fetchResources,
  };
};

// Hook: useSyllabusParser
// Handle file upload and topic extraction (mocked)
export const useSyllabusParser = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedTopics, setExtractedTopics] = useState<Array<{ id: string; name: string; estimatedMinutes: number; difficulty: number }>>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const parseFile = useCallback(async (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsParsing(true);
    setError(null);

    // Simulate POST /api/ai/parse-syllabus
    await mockDelay(2500);

    // Mock structuredConcepts from API response
    const mockTopics = [
      { id: uuidv4(), name: 'Introduction to Data Structures', estimatedMinutes: 45, difficulty: 2 },
      { id: uuidv4(), name: 'Arrays and Strings', estimatedMinutes: 60, difficulty: 2 },
      { id: uuidv4(), name: 'Linked Lists - Singly and Doubly', estimatedMinutes: 75, difficulty: 3 },
      { id: uuidv4(), name: 'Stack Operations and Applications', estimatedMinutes: 45, difficulty: 2 },
      { id: uuidv4(), name: 'Queue Implementations', estimatedMinutes: 45, difficulty: 2 },
      { id: uuidv4(), name: 'Binary Trees and Traversals', estimatedMinutes: 90, difficulty: 4 },
      { id: uuidv4(), name: 'Binary Search Trees', estimatedMinutes: 60, difficulty: 3 },
      { id: uuidv4(), name: 'AVL Trees and Rotations', estimatedMinutes: 75, difficulty: 4 },
      { id: uuidv4(), name: 'Graph Representations', estimatedMinutes: 60, difficulty: 3 },
      { id: uuidv4(), name: 'BFS and DFS Algorithms', estimatedMinutes: 90, difficulty: 4 },
      { id: uuidv4(), name: 'Sorting Algorithms Comparison', estimatedMinutes: 75, difficulty: 3 },
      { id: uuidv4(), name: 'Hashing Techniques', estimatedMinutes: 60, difficulty: 3 },
    ];

    setExtractedTopics(mockTopics);
    setIsParsing(false);
  }, []);

  const confirmTopics = useCallback(async (selectedTopicIds: string[]) => {
    // In real app, this would call POST /api/concepts/bulk
    const selectedTopics = extractedTopics.filter(t => selectedTopicIds.includes(t.id));
    console.log('Confirming topics to POST /api/concepts/bulk:', selectedTopics);
    await mockDelay(500);
    return selectedTopics;
  }, [extractedTopics]);

  const clearParser = useCallback(() => {
    setFile(null);
    setExtractedTopics([]);
    setError(null);
  }, []);

  return {
    file,
    extractedTopics,
    isParsing,
    error,
    parseFile,
    confirmTopics,
    clearParser,
  };
};
