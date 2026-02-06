"use client";

import { useAuthBootstrap } from "@/hooks/auth/useAuthBootstrap";

export const AuthBootstrapper = () => {
  useAuthBootstrap();
  return null;
};
