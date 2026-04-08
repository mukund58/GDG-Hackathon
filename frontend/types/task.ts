export type TaskItem = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  projectId: string;
  assignedUserId?: string | null;
  dueDate?: string | null;
  createdAt?: string;
};

export type TaskQuery = {
  page?: number;
  pageSize?: number;
  status?: string;
  assignedTo?: string;
  sortBy?: string;
  sortDescending?: boolean;
};