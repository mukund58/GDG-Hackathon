import type { DashboardStats } from "@/types/dashboard";
import { apiClient } from "@/services/api/client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export async function getDashboardStatsSSR() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/dashboard`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as DashboardStats;
  } catch {
    return null;
  }
}

export function getDashboardStats() {
  return apiClient.get<DashboardStats>("/api/dashboard", {
    auth: true,
  });
}
