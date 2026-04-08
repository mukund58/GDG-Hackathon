import { apiClient } from "@/services/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type { TaskItem, TaskQuery } from "@/types/task";

export async function getTasks(query: TaskQuery = {}) {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<TaskItem>>>("/api/tasks", {
    auth: true,
    query,
  });

  return response.data;
}