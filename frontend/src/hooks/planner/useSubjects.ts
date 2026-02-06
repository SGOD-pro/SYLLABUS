import { useCallback, useEffect, useState } from 'react';
import { useUserStore } from '@/store';
import { v4 as uuidv4 } from 'uuid';
import { mockDelay } from '@/hooks/shared/mockDelay';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api-client';
import { API_ROUTES } from '@/lib/api-routes';

// Hook: useSubjects
// CRUD operations for subjects
export const useSubjects = () => {
  const { profile, addSubject, removeSubject, updateSubject, setProfile } = useUserStore();
  const { getToken } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const subjects = profile?.subjects || [];

  useEffect(() => {
    if (hasFetched) return;
    setHasFetched(true);

    const run = async () => {
      try {
        const res = await api<
          Array<{
            id: string;
            name: string;
            examDate: string;
            isBacklog: boolean;
            creditWeight?: number;
          }>
        >(API_ROUTES.SUBJECTS.GET, { getToken });

        if (Array.isArray(res) && res.length > 0 && profile) {
          const mapped: Subject[] = res
            .filter((s) => s && typeof s.id === 'string' && typeof s.name === 'string')
            .map((s) => {
              const existing = profile.subjects.find((sub) => sub.id === s.id);
              return {
                id: s.id,
                name: s.name,
                examDate: new Date(s.examDate),
                isBacklog: Boolean(s.isBacklog),
                creditWeight: typeof s.creditWeight === 'number' ? s.creditWeight : 4,
                concepts: existing?.concepts ?? [],
              };
            });

          if (mapped.length > 0) {
            const withConcepts = await Promise.all(
              mapped.map(async (subject) => {
                try {
                  const conceptsRes = await api<any[]>(
                    API_ROUTES.CONCEPTS.BY_SUBJECT(subject.id),
                    { getToken }
                  );

                  if (Array.isArray(conceptsRes) && conceptsRes.length > 0) {
                    const concepts: Concept[] = conceptsRes
                      .filter(
                        (c) =>
                          c &&
                          typeof c.id === 'string' &&
                          typeof c.name === 'string' &&
                          typeof c.difficulty === 'number' &&
                          typeof c.estimatedMinutes === 'number'
                      )
                      .map((c) => ({
                        id: c.id,
                        name: c.name,
                        difficulty: c.difficulty,
                        estimatedMinutes: c.estimatedMinutes,
                        isHighWeight: typeof c.isHighWeight === 'boolean' ? c.isHighWeight : false,
                        subjectId: subject.id,
                        prerequisites: Array.isArray(c.prerequisites) ? c.prerequisites : [],
                      }))
                      .filter(
                        (c) =>
                          c.difficulty >= 1 &&
                          c.difficulty <= 5 &&
                          c.estimatedMinutes > 0
                      );

                    if (concepts.length > 0) {
                      const backendByName = new Map<string, Concept>();
                      concepts.forEach((c) => {
                        backendByName.set(c.name.trim().toLowerCase(), c);
                      });

                      const localConcepts = subject.concepts ?? [];
                      const localByName = new Map<string, Concept>();
                      localConcepts.forEach((c) => {
                        if (c?.name) {
                          localByName.set(c.name.trim().toLowerCase(), c);
                        }
                      });

                      const reconciled = concepts.map((backend) => {
                        const key = backend.name.trim().toLowerCase();
                        const local = localByName.get(key);
                        if (!local) return backend;

                        return {
                          ...backend,
                          id: backend.id,
                          difficulty: local.difficulty,
                          estimatedMinutes: local.estimatedMinutes,
                          isHighWeight: local.isHighWeight,
                          subjectId: subject.id,
                        };
                      });

                      return { ...subject, concepts: reconciled };
                    }
                  }
                } catch (err) {
                  console.warn('Failed to fetch concepts', err);
                }

                return subject;
              })
            );

            const normalized = withConcepts.map((subject) => {
              const localFallback =
                profile.subjects.find((s) => s.id === subject.id)?.concepts ?? [];

              const safeConcepts = subject.concepts
                .filter(
                  (c) =>
                    c &&
                    typeof c.id === 'string' &&
                    typeof c.name === 'string' &&
                    typeof c.difficulty === 'number' &&
                    typeof c.estimatedMinutes === 'number'
                )
                .map((c) => ({
                  ...c,
                  isHighWeight: typeof c.isHighWeight === 'boolean' ? c.isHighWeight : false,
                  prerequisites: Array.isArray(c.prerequisites) ? c.prerequisites : [],
                  subjectId: subject.id,
                }))
                .filter(
                  (c) =>
                    c.difficulty >= 1 &&
                    c.difficulty <= 5 &&
                    c.estimatedMinutes > 0
                );

              if (safeConcepts.length === 0) {
                return { ...subject, concepts: localFallback };
              }

              return { ...subject, concepts: safeConcepts };
            });

            setProfile({ ...profile, subjects: normalized });
          }
        }
      } catch (err) {
        console.warn('Failed to fetch subjects', err);
      }
    };

    run();
  }, [hasFetched, getToken, profile, setProfile]);

  const addSubjectFromTemplate = useCallback(
    async (templateName: string, examDate: Date, isBacklog: boolean = false) => {
      setIsLoading(true);
      await mockDelay(300);

      const priorityWeight = isBacklog ? 1.5 : 1.0;
      try {
        const created = await api<{
          id: string;
          name: string;
          examDate: string;
          isBacklog: boolean;
          creditWeight?: number;
        }>(API_ROUTES.SUBJECTS.CREATE, {
          method: 'POST',
          body: {
            name: templateName,
            examDate: examDate.toISOString(),
            isBacklog,
            priorityWeight,
          },
          getToken,
        });

        if (created?.id && created?.name) {
          addSubject({
            id: created.id,
            name: created.name,
            examDate: new Date(created.examDate),
            isBacklog: Boolean(created.isBacklog),
            creditWeight: 4,
            concepts: [],
          });
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Failed to create subject', err);
      }

      setIsLoading(false);
    },
    [addSubject, getToken]
  );

  const addCustomSubject = useCallback(
    async (name: string, examDate: Date, isBacklog: boolean = false) => {
      setIsLoading(true);
      await mockDelay(300);

      const priorityWeight = isBacklog ? 1.5 : 1.0;
      try {
        const created = await api<{
          id: string;
          name: string;
          examDate: string;
          isBacklog: boolean;
          creditWeight?: number;
        }>(API_ROUTES.SUBJECTS.CREATE, {
          method: 'POST',
          body: {
            name,
            examDate: examDate.toISOString(),
            isBacklog,
            priorityWeight,
          },
          getToken,
        });

        if (created?.id && created?.name) {
          addSubject({
            id: created.id,
            name: created.name,
            examDate: new Date(created.examDate),
            isBacklog: Boolean(created.isBacklog),
            creditWeight: 4,
            concepts: [],
          });
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Failed to create subject', err);
      }

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
    [addSubject, getToken]
  );

  const addConceptToSubject = useCallback(
    async (
      subjectId: string,
      data: {
        name: string;
        difficulty: number;
        estimatedMinutes: number;
        isHighWeight?: boolean;
      }
    ) => {
      const subject = subjects.find((s) => s.id === subjectId);
      if (!subject) return false;

      const trimmedName = data.name.trim();
      if (!trimmedName) return false;

      const nameKey = trimmedName.toLowerCase();
      const hasDuplicate = subject.concepts.some(
        (c) => c?.name?.trim().toLowerCase() === nameKey
      );
      if (hasDuplicate) return false;

      try {
        const created = await api<{
          id: string;
          name: string;
          difficulty?: number;
          estimatedMinutes?: number;
          isHighWeight?: boolean;
          subjectId?: string;
          prerequisites?: string[];
        }>(API_ROUTES.CONCEPTS.CREATE, {
          method: 'POST',
          body: {
            subjectId,
            name: trimmedName,
            difficulty: data.difficulty,
            estimatedMinutes: data.estimatedMinutes,
            isHighWeight: data.isHighWeight,
          },
          getToken,
        });

        if (created?.id && typeof created.id === 'string' && created?.name) {
          const concept: Concept = {
            id: created.id,
            name: created.name,
            difficulty:
              typeof created.difficulty === 'number'
                ? created.difficulty
                : data.difficulty,
            estimatedMinutes:
              typeof created.estimatedMinutes === 'number'
                ? created.estimatedMinutes
                : data.estimatedMinutes,
            isHighWeight:
              typeof created.isHighWeight === 'boolean'
                ? created.isHighWeight
                : Boolean(data.isHighWeight),
            subjectId,
            prerequisites: Array.isArray(created.prerequisites)
              ? created.prerequisites
              : [],
          };

          updateSubject(subjectId, { concepts: [...subject.concepts, concept] });
          return true;
        }
      } catch (err) {
        console.warn('Failed to create concept', err);
      }

      const localConcept: Concept = {
        id: uuidv4(),
        name: trimmedName,
        difficulty: data.difficulty,
        estimatedMinutes: data.estimatedMinutes,
        isHighWeight: Boolean(data.isHighWeight),
        subjectId,
        prerequisites: [],
      };

      updateSubject(subjectId, { concepts: [...subject.concepts, localConcept] });
      return true;
    },
    [subjects, updateSubject, getToken]
  );

  return {
    subjects,
    isLoading,
    addSubjectFromTemplate,
    addCustomSubject,
    addConceptToSubject,
    removeSubject,
    updateSubject,
  };
};
