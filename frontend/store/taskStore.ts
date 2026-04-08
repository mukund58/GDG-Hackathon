export type TaskFilters = {
  status?: string;
  assignedTo?: string;
  search?: string;
  page: number;
  pageSize: number;
};

export type TaskStoreState = {
  filters: TaskFilters;
};

export const taskStoreInitialState: TaskStoreState = {
  filters: {
    status: undefined,
    assignedTo: undefined,
    search: "",
    page: 1,
    pageSize: 10,
  },
};