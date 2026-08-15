import { DynamicPagination, Pagination } from '../api-response';

export interface Category {
  _id?: string;
  name: string;
  description?: string;
  isActive: boolean;
  business: string; // Multi-tenant: business ID
  productCount?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface CategoryStateModel {
  categories: Category[];
  pagination: Pagination;
  dynamicPagination: DynamicPagination | null;
  selectedCategory: Category | null;
  loading: boolean;
  error: string | null;
  filterCriteria: {
    isActive?: boolean;
    searchTerm?: string;
  };
}
