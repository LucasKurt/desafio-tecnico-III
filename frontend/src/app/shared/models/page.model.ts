export interface Page<T> {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  items: T[];
}

export interface QueryParamns {
  page?: number;
  pageSize?: number;
}
