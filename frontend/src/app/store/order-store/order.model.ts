import { Pagination, DynamicPagination } from '../api-response';
export interface OrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  sellingPrice: number;
  subtotal: number;
  expiryDate: Date | string;
  isBackorder: boolean;
}

export interface Payment {
  amount: number;
  method: "cash" | "card" | "check" | "bank_transfer";
  recordedBy: string | any;
  recordedAt: Date | string;
  notes?: string;
}

export interface Order {
  _id?: string;
  orderNumber: string;
  orderType: "delivery" | "pos";
  client: string | any; // Can be populated object or just ID
  createdBy: string | any;
  assignedTo?: string | any; // Sales person this order is assigned to
  assignedAt?: Date | string;
  assignedFor?: "delivery" | "payment_collection"; // What task is assigned
  items: OrderItem[];
  subtotal: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: "pending" | "partial" | "fully_paid" | "borrow";
  orderStatus: "created" | "assigned" | "completed" | "backorder";
  payments: Payment[];
  isBackorderComplete?: boolean;
  isDelivered?: boolean;
  deliveredAt?: Date | string;
  dueCollected?: boolean;
  dueCollectedAt?: Date | string;
  notes?: string;
  business: string; // Multi-tenant: business ID
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface CreateOrderDto {
  orderType: "delivery" | "pos";
  clientId: string;
  items: Array<{
    itemId: string;
    quantity: number;
    sellingPrice: number;
  }>;
  discount: number;
  notes?: string;
}

export interface UpdateOrderDto {
  discount?: number;
  notes?: string;
  orderStatus?: "created" | "assigned" | "completed" | "backorder";
}

export interface RecordPaymentDto {
  amount: number;
  method: "cash" | "card" | "check" | "bank_transfer";
  notes?: string;
}


export interface OrderStatusCounts {
  createdCount: number;
  assignedCount: number;
  completedCount: number;
  backorderCount: number;
  totalOrderCount: number;
}

export interface SalesDashboardData {
  recentOrders: Order[];
  statusCounts: {
    createdCount: number;
    assignedCount: number;
    completedCount: number;
  };
  revenueToday: number;
  totalRevenue: number;
  totalOrdersCount: number;
  pendingPayment: number;
}

export interface OrderStateModel {
  orders: Order[];
  pagination: Pagination;
  dynamicPagination: DynamicPagination | null;
  selectedOrder: Order | null;
  userOrders: Order[];
  loading: boolean;
  error: string | null;
  filterCriteria: {
    orderStatus?: string;
    paymentStatus?: string;
    orderType?: "delivery" | "pos";
    clientId?: string;
    assignedTo?: string;
    assignedFor?: "delivery" | "payment_collection";
    isDelivered?: boolean;
    dateRange?: {
      startDate: Date;
      endDate: Date;
    };
  };
  statusCounts?: {
    createdCount: number;
    assignedCount: number;
    completedCount: number;
    backorderCount: number;
    totalOrderCount: number;
  };
  salesDashboardData?: SalesDashboardData;
}
