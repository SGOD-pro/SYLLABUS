import { useCallback } from 'react';
import { usePanicModeStore } from '@/store';
import { useAuth } from '@clerk/nextjs';
import { api } from '@/lib/api-client';
import { API_ROUTES } from '@/lib/api-routes';

// Hook: usePanicMode
// Toggle and persist panic state
export const usePanicMode = () => {
  const { isPanicMode, togglePanicMode, setPanicMode } = usePanicModeStore();
  const { getToken } = useAuth();

  // Mock API call for panic toggle
  const togglePanicModeWithAPI = useCallback(async () => {
    try {
      const res = await api<{ panicMode: boolean }>(
        API_ROUTES.PLANNER.PANIC_TOGGLE,
        {
          method: 'POST',
          body: { enabled: !isPanicMode },
          getToken,
        }
      );

      if (typeof res?.panicMode === 'boolean') {
        setPanicMode(res.panicMode);
        return;
      }
    } catch (err) {
      console.warn('Failed to toggle panic mode', err);
      return;
    }
    console.warn('Failed to toggle panic mode: missing panicMode response');
  }, [getToken, isPanicMode, setPanicMode]);

  return {
    isPanicMode,
    togglePanicMode: togglePanicModeWithAPI,
    setPanicMode,
  };
};
