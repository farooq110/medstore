import { createSelector, Selector } from "@ngxs/store";
import { OrderState } from "./order.state";
import { Order, OrderStateModel } from "./order.model";

export class OrderSelectors {
  @Selector([OrderState])
  static allOrders(state: OrderStateModel): Order[] {
    return state.orders;
  }

  @Selector([OrderState])
  static pagination(state: OrderStateModel) {
    return state.pagination;
  }

  @Selector([OrderState])
  static currentPage(state: OrderStateModel): number {
    return state.pagination?.page ?? 1;
  }

  @Selector([OrderState])
  static totalPages(state: OrderStateModel): number {
    return state.pagination?.pages ?? 0;
  }

  @Selector([OrderState])
  static totalCount(state: OrderStateModel): number {
    return state.pagination?.totalCount ?? 0;
  }

  @Selector([OrderState])
  static hasMore(state: OrderStateModel): boolean {
    return state.pagination?.hasMore ?? false;
  }

  @Selector([OrderState])
  static userOrders(state: OrderStateModel): Order[] {
    return state.userOrders;
  }

  @Selector([OrderState])
  static pendingOrders(state: OrderStateModel): Order[] {
    return state.orders.filter((order) => order.paymentStatus === "pending");
  }

  @Selector([OrderState])
  static fullyPaidOrders(state: OrderStateModel): Order[] {
    return state.orders.filter((order) => order.paymentStatus === "fully_paid");
  }

  @Selector([OrderState])
  static backorderOrders(state: OrderStateModel): Order[] {
    return state.orders.filter((order) => order.orderStatus === "backorder");
  }

  @Selector([OrderState])
  static completedOrders(state: OrderStateModel): Order[] {
    return state.orders.filter((order) => order.orderStatus === "completed");
  }

  @Selector([OrderState])
  static assignedOrders(state: OrderStateModel): Order[] {
    return state.orders.filter((order) => order.orderStatus === "assigned");
  }

  @Selector([OrderState])
  static deliveryAssignedOrders(state: OrderStateModel): Order[] {
    return state.orders.filter(
      (order) =>
        order.orderStatus === "assigned" && order.assignedFor === "delivery",
    );
  }

  @Selector([OrderState])
  static paymentAssignedOrders(state: OrderStateModel): Order[] {
    return state.orders.filter(
      (order) =>
        order.orderStatus === "assigned" &&
        order.assignedFor === "payment_collection",
    );
  }

  @Selector([OrderState])
  static selectedOrder(state: OrderStateModel): Order | null {
    return state.selectedOrder;
  }

  @Selector([OrderState])
  static isLoading(state: OrderStateModel): boolean {
    return state.loading;
  }

  @Selector([OrderState])
  static error(state: OrderStateModel): string | null {
    return state.error;
  }

  @Selector([OrderState])
  static totalAmount(state: OrderStateModel): number {
    return state.orders.reduce(
      (sum, order) => sum + (order.totalAmount || 0),
      0,
    );
  }

  @Selector([OrderState])
  static totalDue(state: OrderStateModel): number {
    return state.orders.reduce((sum, order) => sum + (order.dueAmount || 0), 0);
  }

  @Selector([OrderState])
  static pendingPayments(state: OrderStateModel): Order[] {
    return state.orders.filter((order) => order.paymentStatus === "pending");
  }

  // ============ ADVANCED SELECTORS ============
  @Selector([OrderState])
  static createdOrders(state: OrderStateModel): Order[] {
    return state.orders.filter((order) => order.orderStatus === "created");
  }

  @Selector([OrderState])
  static deliveredNotCollectedOrders(state: OrderStateModel): Order[] {
    return state.orders.filter(
      (order) => order.isDelivered && !order.dueCollected

    );
  }

  @Selector([OrderState])
  static pendingDeliveryOrders(state: OrderStateModel): Order[] {
    return state.orders.filter(
      (order) =>
        order.assignedFor === "delivery" && !order.isDelivered
    );
  }

  @Selector([OrderState])
  static pendingDueCollectionOrders(state: OrderStateModel): Order[] {
    return state.orders.filter(
      (order) =>
        order.assignedFor === "payment_collection" && !order.dueCollected
    );
  }

  @Selector([OrderState])
  static borrowOrders(state: OrderStateModel): Order[] {
    return state.orders.filter((order) => order.paymentStatus === "borrow");
  }

  @Selector([OrderState])
  static partialPaidOrders(state: OrderStateModel): Order[] {
    return state.orders.filter((order) => order.paymentStatus === "partial");
  }

  @Selector([OrderState])
  static createdCount(state: OrderStateModel): number {
    return state.statusCounts?.createdCount || 0;
  }

  @Selector([OrderState])
  static assignedCount(state: OrderStateModel): number {
    return state.statusCounts?.assignedCount || 0;
  }

  @Selector([OrderState])
  static completedCount(state: OrderStateModel): number {
    return state.statusCounts?.completedCount || 0;
  }

  @Selector([OrderState])
  static backorderCount(state: OrderStateModel): number {
    return state.statusCounts?.backorderCount || 0;
  }

  @Selector([OrderState])
  static statusCounts(state: OrderStateModel) {
    return state.statusCounts || {
      createdCount: 0,
      assignedCount: 0,
      completedCount: 0,
      backorderCount: 0,
      totalOrderCount: 0,
    };
  }

  @Selector([OrderState])
  static totalOrderCountFromStatus(state: OrderStateModel): number {
    return state.statusCounts?.totalOrderCount || 0;
  }

  @Selector([OrderState])
  static filterCriteria(state: OrderStateModel) {
    return state.filterCriteria;
  }

  @Selector([OrderState])
  static filteredOrders(state: OrderStateModel): Order[] {
    const criteria = state.filterCriteria;
    return state.orders.filter((order) => {
      if (criteria.orderStatus && order.orderStatus !== criteria.orderStatus) {
        return false;
      }
      if (criteria.paymentStatus && order.paymentStatus !== criteria.paymentStatus) {
        return false;
      }
      if (criteria.orderType && order.orderType !== criteria.orderType) {
        return false;
      }
      if (criteria.clientId && order.client?._id !== criteria.clientId && order.client !== criteria.clientId) {
        return false;
      }
      if (criteria.assignedTo && order.assignedTo?._id !== criteria.assignedTo && order.assignedTo !== criteria.assignedTo) {
        return false;
      }
      if (criteria.assignedFor && order.assignedFor !== criteria.assignedFor) {
        return false;
      }
      if (criteria.isDelivered !== undefined && order.isDelivered !== criteria.isDelivered) {
        return false;
      }
      return true;
    });
  }

  static paginationWithParams = (paginationType: string) => {
    return createSelector(
      [OrderState],
      (state: OrderStateModel) => {
        return state.dynamicPagination?.[paginationType] ?? {
          page: 0,
          hasMore: false,
          pages: 0,
          totalCount: 0,
        };
      }
    );
  };

  @Selector([OrderState])
  static salesDashboardData(state: OrderStateModel) {
    return state.salesDashboardData;
  }
}
