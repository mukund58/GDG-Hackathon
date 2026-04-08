import { apiClient } from "@/services/api/client";
import type { ApiResponse, PaginatedResponse } from "@/types/api";
import type {
  CreateTaskChecklistInput,
  CreateTaskCommentInput,
  CreateTaskInput,
  TaskActivity,
  TaskChecklistItem,
  TaskChecklistSummary,
  TaskComment,
  TaskItem,
  TaskQuery,
  UpdateTaskInput,
} from "@/types/task";

export async function getTasks(query: TaskQuery = {}) {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<TaskItem>>>("/api/tasks", {
    auth: true,
    query,
  });

  return response.data;
}

export async function getTaskById(taskId: string) {
  const response = await apiClient.get<ApiResponse<TaskItem>>(`/api/tasks/${taskId}`, {
    auth: true,
  });

  return response.data;
}

export async function createTask(payload: CreateTaskInput) {
  const response = await apiClient.post<ApiResponse<TaskItem>>("/api/tasks", payload, {
    auth: true,
  });

  return response.data;
}

export async function updateTask(taskId: string, payload: UpdateTaskInput) {
  const response = await apiClient.put<ApiResponse<TaskItem>>(`/api/tasks/${taskId}`, payload, {
    auth: true,
  });

  return response.data;
}

export async function updateTaskStatus(taskId: string, status: string) {
  const response = await apiClient.patch<ApiResponse<TaskItem>>(
    `/api/tasks/${taskId}/status`,
    { status },
    { auth: true },
  );

  return response.data;
}

export async function assignTask(taskId: string, userId: string) {
  const response = await apiClient.patch<ApiResponse<TaskItem>>(
    `/api/tasks/${taskId}/assign`,
    { userId },
    { auth: true },
  );

  return response.data;
}

export async function deleteTask(taskId: string) {
  await apiClient.delete<ApiResponse<object>>(`/api/tasks/${taskId}`, {
    auth: true,
  });
}

export async function getTaskActivity(taskId: string) {
  const response = await apiClient.get<ApiResponse<TaskActivity[]>>(`/api/tasks/${taskId}/activity`, {
    auth: true,
  });

  return response.data;
}

export async function getTaskChecklist(taskId: string) {
  const response = await apiClient.get<ApiResponse<TaskChecklistItem[]>>(`/api/tasks/${taskId}/checklist`, {
    auth: true,
  });

  return response.data;
}

export async function getTaskChecklistSummary(taskId: string) {
  const response = await apiClient.get<ApiResponse<TaskChecklistSummary>>(`/api/tasks/${taskId}/checklist/summary`, {
    auth: true,
  });

  return response.data;
}

export async function addTaskChecklistItem(taskId: string, payload: CreateTaskChecklistInput) {
  const response = await apiClient.post<ApiResponse<TaskChecklistItem>>(
    `/api/tasks/${taskId}/checklist`,
    { title: payload.title, order: payload.order ?? 0 },
    { auth: true },
  );

  return response.data;
}

export async function toggleTaskChecklistItem(taskId: string, checklistItemId: string) {
  const response = await apiClient.patch<ApiResponse<TaskChecklistItem>>(
    `/api/tasks/${taskId}/checklist/${checklistItemId}/toggle`,
    {},
    { auth: true },
  );

  return response.data;
}

export async function updateTaskChecklistItemCompletion(taskId: string, checklistItemId: string, isCompleted: boolean) {
  const response = await apiClient.patch<ApiResponse<TaskChecklistItem>>(
    `/api/tasks/${taskId}/checklist/${checklistItemId}`,
    { isCompleted },
    { auth: true },
  );

  return response.data;
}

export async function getTaskComments(taskId: string) {
  const response = await apiClient.get<ApiResponse<TaskComment[]>>(`/api/tasks/${taskId}/comments`, {
    auth: true,
  });

  return response.data;
}

export async function addTaskComment(taskId: string, payload: CreateTaskCommentInput) {
  const response = await apiClient.post<ApiResponse<TaskComment>>(`/api/tasks/${taskId}/comments`, payload, {
    auth: true,
  });

  return response.data;
}

export async function updateTaskComment(taskId: string, commentId: string, content: string) {
  const response = await apiClient.put<ApiResponse<TaskComment>>(
    `/api/tasks/${taskId}/comments/${commentId}`,
    { content },
    { auth: true },
  );

  return response.data;
}

export async function deleteTaskComment(taskId: string, commentId: string) {
  await apiClient.delete<ApiResponse<object>>(`/api/tasks/${taskId}/comments/${commentId}`, {
    auth: true,
  });
}