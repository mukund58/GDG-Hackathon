type Primitive = string | number | boolean;

export type QueryParams = Record<string, Primitive | null | undefined>;

export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
  errors?: string[];
};

export type PaginatedResponse<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
};