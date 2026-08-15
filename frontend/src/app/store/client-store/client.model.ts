import { Pagination, DynamicPagination } from '../api-response';

export interface Client {
  _id?: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  shopName?: string;
  salesPerson?: string | any; // Virtual field: Can be populated object or just ID (not populated for sales_person role)
  totalDue: number;
  creditLimit: number;
  isActive: boolean;
  business: string; // Multi-tenant: business ID
  ntn?: string; // National Tax Number (optional)
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CreateClientDto {
  name: string;
  phone: string;
  email?: string;
  address: string;
  shopName?: string;
  creditLimit?: number;
  salesPerson?: string;
  ntn?: string;
}

export interface UpdateClientDto {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  shopName?: string;
  creditLimit?: number;
  isActive?: boolean;
  salesPerson?: string;
  ntn?: string;
}

export interface ClientDues {
  client: { id: string; name: string };
  totalDue: number;
  creditLimit: number;
  availableCredit: number;
  pendingOrders: Array<{
    orderNumber: string;
    totalAmount: number;
    paidAmount: number;
    dueAmount: number;
    paymentStatus: string;
  }>;
}

export interface ClientDetailData {
  client: Client;
  analytics: {
    orders: {
      total: number;
      completed: number;
      pending: number;
      avgOrderValue: number;
    };
    payment: {
      totalAmount: number;
      totalPaid: number;
      totalDue: number;
      paymentRate: number;
    };
    credit: {
      creditLimit: number;
      outstanding: number;
      available: number;
      utilization: number;
      status: string;
    };
  };
  recentOrders: any[];
}

export interface ClientStateModel {
  clients: Client[];
  pagination: Pagination;
  dynamicPagination: DynamicPagination | null;
  selectedClient: Client | null;
  selectedClientDetails: ClientDetailData | null;
  loading: boolean;
  error: string | null;
  filterCriteria: {
    isActive?: boolean;
    searchTerm?: string;
  };
}
