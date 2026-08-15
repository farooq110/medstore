export interface DashboardSummary {
  totalOrders: number;
  totalDue: number;
  lowStockItems: number;
  expiringItems: number;
  thisMonthOrderCount: number;
  outstandingPendingCount: number;
  expiringThreshold: number;
  currency: string;
}

export interface DashboardStateModel {
  summary: DashboardSummary | null;
  loading: boolean;
  error: string | null;
}
