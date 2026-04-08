import { apiClient } from "@/services/api/client";
import { clearAuthToken, setAuthToken } from "@/services/auth/token-store";
import type { ApiResponse } from "@/types/api";
import type { AuthPayload, LoginInput, RegisterInput } from "@/types/auth";

async function unwrapAuthResponse(path: string, payload: LoginInput | RegisterInput) {
  const response = await apiClient.post<ApiResponse<AuthPayload>>(path, payload);
  const authPayload = response.data;

  if (authPayload?.token) {
    setAuthToken(authPayload.token);
  }

  return authPayload;
}

export function login(payload: LoginInput) {
  return unwrapAuthResponse("/api/auth/login", payload);
}

export function register(payload: RegisterInput) {
  return unwrapAuthResponse("/api/auth/register", payload);
}

export function logout() {
  clearAuthToken();
}