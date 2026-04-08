import type { AuthUser } from "@/types/auth";

export type AuthStoreState = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
};

export const authStoreInitialState: AuthStoreState = {
  token: null,
  user: null,
  isAuthenticated: false,
};