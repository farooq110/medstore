export enum StripeEvents {
  CHECKOUT_SESSION_COMPLETED = "checkout.session.completed",
  CUSTOMER_SUBSCRIPTION_CREATED = "customer.subscription.created",
  CUSTOMER_SUBSCRIPTION_UPDATED = "customer.subscription.updated",
  CUSTOMER_SUBSCRIPTION_DELETED = "customer.subscription.deleted",
  INVOICE_PAYMENT_SUCCEEDED = "invoice.payment_succeeded",
  INVOICE_PAYMENT_FAILED = "invoice.payment_failed",
}

export enum SubscriptionStatus {
  NONE = "none",
  TRIALING = "trialing",
  ACTIVE = "active",
  PAST_DUE = "past_due",
  CANCELED = "canceled",
  UNPAID = "unpaid",
  INCOMPLETE = "incomplete",
  INCOMPLETE_EXPIRED = "incomplete_expired",
}
