"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { api } from "@/lib/api-client";
import { useUserStore } from "@/store";
import { API_ROUTES } from "@/lib/api-routes";

type MeResponse = {
  id: string;
  degree?: string;
  semester?: number;
};

export const useAuthBootstrap = () => {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { profile, updateProfile, clearProfile } = useUserStore();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!isLoaded) {
      setIsLoading(true);
      return;
    }

    if (!isSignedIn) {
      clearProfile();
      setError(null);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const me = await api<MeResponse>(API_ROUTES.USERS.ME, { getToken });
        if (!isMounted) return;

        if (profile) {
          const patch: Partial<UserProfile> = {};
          if (me.id) patch.id = me.id;
          if (me.degree) patch.degree = me.degree as Degree;
          if (typeof me.semester === "number") patch.semester = me.semester;

          if (Object.keys(patch).length > 0) {
            updateProfile(patch);
          }
        }

        setIsLoading(false);
      } catch (err) {
        if (!isMounted) return;
        clearProfile();
        setError(err as Error);
        setIsLoading(false);
      }
    };

    run();

    return () => {
      isMounted = false;
    };
  }, [isLoaded, isSignedIn, getToken, profile, updateProfile, clearProfile]);

  return {
    isLoading,
    isSignedIn: Boolean(isSignedIn && isLoaded),
    error,
  };
};
