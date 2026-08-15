import { USER_ROLES } from "../constants/roles"
export { USER_ROLES }

export interface User {
  _id: string
  name: string
  email: string
  phone: string
  role: USER_ROLES
  business?: Business | string
  assignedClients: Client[]
  stripeCustomerId?: string
  stripeSubscriptionId?: string
  subscriptionStatus: string
  subscriptionEndDate?: string
  isActive: boolean
  createdAt?: string
}

export interface Business {
  _id: string
  name: string
  owner: string | User
  country: string
  phone?: string
  address?: string
  logo?: string
  website?: string
  businessLicense?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Category {
  _id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Client {
  _id: string
  name: string
  phone: string
  email: string
  address: string
  shopName: string
  totalDue: number
  creditLimit: number
  isActive: boolean
  ntn?: string
  salesPerson?: {
    _id: string
    name: string
    email: string
  }
  createdAt: string
}

export interface Item {
  _id: string
  name: string
  category: Category | string
  sku: string
  stockQuantity: number
  lowStockThreshold: number
  sellingPrice: number
  costPrice: number
  expiryDate: string
  isExpired: boolean
  description?: string
}

export interface OrderItem {
  _id?: string
  itemId: string | Item
  item?: Item
  itemName: string
  quantity: number
  sellingPrice: number
  subtotal: number
  isBackorder: boolean
}

export interface Payment {
  _id?: string // Added for UI compatibility
  amount: number
  method: "cash" | "card" | "check" | "bank_transfer" | string
  recordedBy: string | User
  recordedAt: string
  notes?: string
}

export type OrderType = "delivery" | "pos"
export type OrderStatus = "created" | "assigned" | "items_provided" | "completed" | "backorder"
export type PaymentStatus = "pending" | "partial" | "fully_paid" | "borrow"

export interface Order {
  _id: string
  orderNumber: string
  orderType: OrderType
  client: string | Client
  assignedTo?: string | User
  assignedAt?: string
  assignedFor?: "delivery" | "payment_collection"
  items: OrderItem[]
  subtotal: number
  discount: number
  totalAmount: number
  paidAmount: number
  dueAmount: number
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  payments: Payment[]
  isDelivered?: boolean
  deliveredAt?: string
  dueCollected?: boolean
  dueCollectedAt?: string
  notes?: string
  shareToken?: string
  createdBy?: string | User
  createdAt: string
  updatedAt?: string
}

export type AlertType = "low_stock" | "out_of_stock" | "expiring_soon" | "expired" | "backorder_pending"
export type AlertSeverity = "warning" | "urgent"

export interface Alert {
  _id: string
  type: AlertType
  itemId?: string | Item
  orderId?: string | Order
  message: string
  severity: AlertSeverity
  seenByOwner: boolean
  seenBySalesPerson: boolean
  resolved: boolean
  createdAt: string
  item?: Item
}

export interface ApiResponse<T> {
  success: boolean
  message?: string
  data: T
}

export interface Pagination {
  page: number
  limit: number
  totalCount: number
  hasMore: boolean
  pages: number
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: Pagination
  msg: string
}

export interface Plan {
  _id: string
  name: string
  stripePriceId: string
  country: string
  tier: "Basic" | "Pro"
  price: number
  currency: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface ClientDetailAnalytics {
  orders: {
    total: number
    completed: number
    pending: number
    avgOrderValue: number
  }
  payment: {
    totalAmount: number
    totalPaid: number
    totalDue: number
    paymentRate: number
  }
  credit: {
    creditLimit: number
    outstanding: number
    available: number
    utilization: number
    status: "success" | "warning" | "danger" | string
  }
}

export interface RecentClientOrder {
  _id: string
  orderNumber: string
  createdAt: string
  orderStatus: OrderStatus
  totalAmount: number
  paidAmount: number
  dueAmount: number
  paymentStatus: PaymentStatus
}

export interface ClientDetailData {
  client: Client
  analytics: ClientDetailAnalytics
  recentOrders: RecentClientOrder[]
}

