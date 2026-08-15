export interface Pagination {
  page?: number;
  totalCount?: number;
  hasMore?: boolean;
  pages?: number;
}

export interface DynamicPagination {
  [key: string]: Pagination;
}

export interface PaginationParams {
  page: number;
  limit?: number;
}

export interface FilterParams {
  sortBy?: any;
  search?: string;
  filter?: any;
}

export interface ApiResponse<T> {
  success?: boolean;
  message?: string;
  data: T;
  pagination?: Pagination;
  msg?: string;
}

// ============ ACTION OPTIONS ============
export interface ActionOptions {
  isLoading?: boolean;
  showToast?: boolean;          // Show success/error toasts
  successMessage?: string;       // Custom success message
  errorMessage?: string;         // Custom error message
}
