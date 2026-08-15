import { Pagination, DynamicPagination } from '../api-response';
export interface User {
  _id?: string;
  name: string;
  email: string;
  password?: string; // Not returned from API
  phone: string;
  role: 'owner' | 'sales_person';
  isActive: boolean;
  business: string; // Multi-tenant: business ID
  assignedClients?: ClientOption[]; // Clients assigned to sales person
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  phone: string;
  role: 'owner' | 'sales_person';
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  role?: 'owner' | 'sales_person';
  isActive?: boolean;
}

export interface ClientOption {
  _id: string;
  name: string;
  phone: string;
  email: string;
  shop: string;
  isAssigned: boolean;
  business: string; // Multi-tenant: business ID
}

export interface UserStateModel {
  users: User[];
  pagination: Pagination;
  dynamicPagination: DynamicPagination | null;
  currentUser: User | null;
  selectedUser: User | null;
  clientOptions: ClientOption[];
  loading: boolean;
  error: string | null;
  filterCriteria: {
    role?: 'owner' | 'sales_person';
    isActive?: boolean;
    searchTerm?: string;
  };
}
