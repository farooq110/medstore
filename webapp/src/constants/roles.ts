export enum USER_ROLES {
  OWNER = "owner",
  SALES_PERSON = "sales_person"
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
  pending = "Pending",
  partial = "Partial",
  fully_paid = "Fully Paid",
  borrow = "Borrow",
}