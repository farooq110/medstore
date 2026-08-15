import { differenceInDays } from "date-fns";

export const calculateExpiryDays = (expiryDate: Date): number => {
  return differenceInDays(new Date(expiryDate), new Date());
};

export const isExpired = (expiryDate: Date): boolean => {
  return new Date(expiryDate) < new Date();
};

export const isExpiringsoon = (expiryDate: Date, days: number = 30): boolean => {
  const daysLeft = calculateExpiryDays(expiryDate);
  return daysLeft > 0 && daysLeft <= days;
};

export const generateOrderNumber = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `ORD-${timestamp}-${random}`;
};

export const generateSKU = (): string => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000);
  return `SKU-${timestamp}-${random}`;
};

export const calculateTotalDue = (orders: any[]): number => {
  return orders.reduce((total, order) => total + order.dueAmount, 0);
};

export const formatCurrency = (amount: number): string => {
  return `₹${amount.toFixed(2)}`;
};

export const calculateDiscount = (subtotal: number, discountPercent: number): number => {
  return (subtotal * discountPercent) / 100;
};
