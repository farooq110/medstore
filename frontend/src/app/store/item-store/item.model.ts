import { Pagination, DynamicPagination } from '../api-response';
import { Category } from '../category-store';

export interface Item {
  _id?: string;
  name: string;
  category: Category; // CategoryId reference
  stockQuantity: number;
  lowStockThreshold: number;
  expiryDate: Date | string;
  sellingPrice: number;
  costPrice?: number;
  isExpired: boolean;
  isExpiringSoon?: boolean;
  isLowStock?: boolean;
  sku?: string;
  description?: string;
  business: string; // Multi-tenant: business ID
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface ItemWithCategory extends Item {
  categoryName?: string;
  categoryDetails?: any;
}

export interface CreateItemDto {
  name: string;
  category: string;
  stockQuantity: number;
  lowStockThreshold?: number;
  expiryDate: Date | string;
  sellingPrice: number;
  costPrice?: number;
  sku?: string;
  description?: string;
}

export interface UpdateItemDto {
  name?: string;
  category?: string;
  stockQuantity?: number;
  lowStockThreshold?: number;
  expiryDate?: Date | string;
  sellingPrice?: number;
  costPrice?: number;
  sku?: string;
  description?: string;
  isExpired?: boolean;
}

export interface LowStockItem extends Item {
  availableStock: number;
}

export interface ItemStateModel {
  items: Item[];
  pagination: Pagination;
  dynamicPagination: DynamicPagination | null;
  lowStockItems: LowStockItem[];
  expiringItems: Item[];
  outOfStockItems: Item[];
  selectedItem: Item | null;
  loading: boolean;
  error: string | null;
  filterCriteria?: {
    category?: string;
    searchTerm?: string;
    isLowStock?: boolean;
    isOutOfStock?: boolean;
    isExpired?: boolean;
    isExpiringSoon?: boolean;
  };
}
