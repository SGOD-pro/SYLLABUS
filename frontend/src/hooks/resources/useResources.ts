import { useCallback, useEffect, useState } from 'react';
import { usePanicMode } from '@/hooks/planner/usePanicMode';
import { mockDelay } from '@/hooks/shared/mockDelay';

// Hook: useResources
// Get learning resources for a topic (mocked)
export const useResources = (conceptName?: string) => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isPanicMode } = usePanicMode();

  const fetchResources = useCallback(
    async (topic?: string) => {
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
    },
    [isPanicMode]
  );

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
