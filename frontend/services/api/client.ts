import { getAuthToken } from "@/services/auth/token-store";
import { clearAuthToken } from "@/services/auth/token-store";
import { useAuthStore } from "@/store/authStore";
import type { QueryParams } from "@/types/api";

const FALLBACK_BASE_URL = "http://localhost:5000";
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? FALLBACK_BASE_URL).replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  details: unknown;

  constructor(message: string, status: number, details: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

type ApiRequestOptions = Omit<RequestInit, "body"> & {
  auth?: boolean;
  token?: string | null;
  query?: QueryParams;
  body?: BodyInit | Record<string, unknown>;
};

function createUrl(path: string, query?: QueryParams) {
  const isAbsolutePath = /^https?:\/\//i.test(path);
  const normalizedPath = isAbsolutePath ? path : `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

  const url = new URL(normalizedPath);
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      if (value === undefined || value === null || value === "") {
        return;
      }

      url.searchParams.set(key, String(value));
    });
  }

  return url.toString();
}

function getErrorMessage(payload: unknown, status: number) {
  if (typeof payload === "object" && payload !== null) {
    if ("message" in payload && typeof payload.message === "string") {
      return payload.message;
    }

    if ("Message" in payload && typeof payload.Message === "string") {
      return payload.Message;
    }
  }

  return `Request failed with status ${status}`;
}

async function request<T>(path: string, options: ApiRequestOptions = {}) {
  const { auth = false, token, query, body, headers, ...requestInit } = options;
  const authToken = auth ? token ?? getAuthToken() : token;
  const isFormData = typeof FormData !== "undefined" && body instanceof FormData;

  const nextHeaders = new Headers(headers ?? {});
  if (!isFormData && body !== undefined && !nextHeaders.has("Content-Type")) {
    nextHeaders.set("Content-Type", "application/json");
  }

  if (authToken) {
    nextHeaders.set("Authorization", `Bearer ${authToken}`);
  }

  const response = await fetch(createUrl(path, query), {
    ...requestInit,
    headers: nextHeaders,
    body: body === undefined || isFormData || typeof body === "string" ? body : JSON.stringify(body),
  });

  const contentType = response.headers.get("content-type") ?? "";
  const isJson = contentType.includes("application/json");
  const payload = isJson ? await response.json().catch(() => null) : await response.text();

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken();
      useAuthStore.getState().clearSession();
    }

    throw new ApiError(getErrorMessage(payload, response.status), response.status, payload);
  }

  return payload as T;
}

export const apiClient = {
  get<T>(path: string, options: Omit<ApiRequestOptions, "method" | "body"> = {}) {
    return request<T>(path, { ...options, method: "GET" });
  },

  post<T>(path: string, body?: ApiRequestOptions["body"], options: Omit<ApiRequestOptions, "method" | "body"> = {}) {
    return request<T>(path, { ...options, method: "POST", body });
  },

  put<T>(path: string, body?: ApiRequestOptions["body"], options: Omit<ApiRequestOptions, "method" | "body"> = {}) {
    return request<T>(path, { ...options, method: "PUT", body });
  },

  patch<T>(path: string, body?: ApiRequestOptions["body"], options: Omit<ApiRequestOptions, "method" | "body"> = {}) {
    return request<T>(path, { ...options, method: "PATCH", body });
  },

  delete<T>(path: string, options: Omit<ApiRequestOptions, "method"> = {}) {
    return request<T>(path, { ...options, method: "DELETE" });
  },
};