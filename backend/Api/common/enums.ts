export enum UserRole {
  OWNER = "owner",
  SALES_PERSON = "sales_person",
  DELIVERY_AGENT = "delivery_agent",
}

export enum OrderStatus {
  CREATED = "created",
  ASSIGNED = "assigned",
  ITEMS_PROVIDED = "items_provided",
  COMPLETED = "completed",
  BACKORDER = "backorder",
}

export enum OrderType {
  DELIVERY = "delivery",
  POS = "pos",
}

export enum PaymentStatus {
  PENDING = "pending",
  PARTIAL = "partial",
  FULLY_PAID = "fully_paid",
  BORROW = "borrow",
}

export enum AlertType {
  LOW_STOCK = "low_stock",
  OUT_OF_STOCK = "out_of_stock",
  EXPIRING_SOON = "expiring_soon",
  EXPIRED = "expired",
  BACKORDER_PENDING = "backorder_pending",
}

export enum AlertSeverity {
  WARNING = "warning",
  URGENT = "urgent",
}
