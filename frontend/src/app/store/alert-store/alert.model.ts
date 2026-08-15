import { Pagination, DynamicPagination } from '../api-response';

export interface Alert {
  _id?: string;
  type: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired' | 'backorder_pending';
  itemId?: string; // Ref to Item
  orderId?: string; // Ref to Order
  message: string;
  severity: 'warning' | 'urgent';
  seenByOwner: boolean;
  seenBySalesPerson: boolean;
  resolved: boolean;
  business: string; // Multi-tenant: business ID
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface AlertDto {
  type: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired' | 'backorder_pending';
  itemId?: string;
  orderId?: string;
  message: string;
  severity: 'warning' | 'urgent';
}

export interface AlertStateModel {
  alerts: Alert[];
  pagination: Pagination;
  dynamicPagination: DynamicPagination | null;
  selectedAlert: Alert | null;
  unreadCount: {
    owner: number;
    salesPerson: number;
  };
  loading: boolean;
  error: string | null;
  filterCriteria: {
    type?: Alert['type'];
    severity?: Alert['severity'];
    resolved?: boolean;
    seenByOwner?: boolean;
    seenBySalesPerson?: boolean;
  };
}
