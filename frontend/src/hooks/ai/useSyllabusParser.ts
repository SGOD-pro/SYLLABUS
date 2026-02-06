import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { mockDelay } from '@/hooks/shared/mockDelay';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api-client';
import { API_ROUTES } from '@/lib/api-routes';
import { useUserStore } from '@/store';

// Hook: useSyllabusParser
// Handle file upload and topic extraction (mocked)
export const useSyllabusParser = () => {
  const [file, setFile] = useState<File | null>(null);
  const [extractedTopics, setExtractedTopics] = useState<
    Array<{ id: string; name: string; estimatedMinutes: number; difficulty: number }>
  >([]);
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth();
  const { profile } = useUserStore();

  const parseFile = useCallback(async (uploadedFile: File) => {
    setFile(uploadedFile);
    setIsParsing(true);
    setError(null);

    let rawText = '';
    try {
      rawText = await uploadedFile.text();
    } catch (err) {
      console.warn('Failed to read syllabus file', err);
    }

    await mockDelay(2500);

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

    const subjectId = (profile as any)?.selectedSubjectId;
    let backendTopics:
      | Array<{ id: string; name: string; estimatedMinutes: number; difficulty: number }>
      | null = null;

    if (!subjectId) {
      console.warn('Missing selectedSubjectId for syllabus parse');
    } else {
      try {
        const res = await api<{
          topics?: Array<{
            name: string;
            difficulty: number;
            estimatedMinutes: number;
          }>;
        }>('/syllabus/parse', {
          method: 'POST',
          body: {
            subjectId,
            rawText,
          },
          getToken,
        });

        const topics = (res as any)?.topics;
        if (Array.isArray(topics)) {
          if (topics.length === 0) {
            backendTopics = [];
          } else {
            const mapped = topics
              .filter(
                (t: any) =>
                  t &&
                  typeof t.name === 'string' &&
                  typeof t.difficulty === 'number' &&
                  typeof t.estimatedMinutes === 'number'
              )
              .map((t: any) => ({
                id: uuidv4(),
                name: t.name,
                difficulty: t.difficulty,
                estimatedMinutes: t.estimatedMinutes,
              }));

            if (mapped.length > 0) {
              backendTopics = mapped;
            }
          }
        }
      } catch (err) {
        console.warn('Failed to parse syllabus via backend', err);
      }
    }

    if (backendTopics !== null) {
      setExtractedTopics(backendTopics);
    } else {
      setExtractedTopics(mockTopics);
    }

    setIsParsing(false);
  }, [getToken, profile]);

  const confirmTopics = useCallback(
    async (selectedTopicIds: string[]) => {
      // In real app, this would call POST /api/concepts/bulk
      const selectedTopics = extractedTopics.filter((t) =>
        selectedTopicIds.includes(t.id)
      );
      const subjectId = (profile as any)?.selectedSubjectId;

      if (!subjectId) {
        console.warn('Missing selectedSubjectId for concept bulk submit');
      } else {
        try {
          await api(API_ROUTES.CONCEPTS.BULK, {
            method: 'POST',
            body: {
              subjectId,
              concepts: selectedTopics.map((t) => ({
                subjectId,
                name: t.name,
                difficulty: t.difficulty,
                estimatedMinutes: t.estimatedMinutes,
              })),
            },
            getToken,
          });
          console.log('Submitted concepts to backend');
        } catch (err) {
          console.warn('Failed to submit concepts', err);
        }
      }

      console.log('Confirming topics to POST /api/concepts/bulk:', selectedTopics);
      await mockDelay(500);
      return selectedTopics;
    },
    [extractedTopics, getToken, profile]
  );

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
