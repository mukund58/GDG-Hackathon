"use client";

import { useEffect, useState } from "react";
import { clearAuthToken, getAuthToken, setAuthToken } from "@/services/auth/token-store";

export function useAuthToken() {
  const [token, setTokenState] = useState<string | null>(null);

  useEffect(() => {
    setTokenState(getAuthToken());
  }, []);

  const updateToken = (nextToken: string) => {
    setAuthToken(nextToken);
    setTokenState(nextToken);
  };

  const clearToken = () => {
    clearAuthToken();
    setTokenState(null);
  };

  return {
    token,
    isAuthenticated: Boolean(token),
    setToken: updateToken,
    clearToken,
  };
}