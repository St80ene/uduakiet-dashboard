export interface IRecordsWithMeta<T> {
  records: T[];
  meta: IPaginationMeta;
}

export interface IPaginationMeta {
  totalItems: number;
  itemCount: number;
  itemsPerPage: number;
  totalPages: number;
  currentPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// Interface wrapper representing the NestJS backend response envelope structure
export interface IApiResponse<T = Record<string, unknown>> {
  status: boolean;
  message: string;
  data?: T;
  error?: unknown;
}

export interface IBasePaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  order?: 'ASC' | 'DESC';
  [key: string]: unknown;
}

export interface IBadgeColors {
  danger: string;
  warning: string;
  brand: string;
}
