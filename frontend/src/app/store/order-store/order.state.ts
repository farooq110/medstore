import { Injectable } from '@angular/core';
import { State, Action, StateContext, Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { selectUserRole } from '../auth-store';
import { OrderStateModel, Order } from './order.model';
import { OrderService, OrderFilterParams } from './order.service';
import {
  LoadOrders,
  LoadOrderById,
  LoadOrdersByClient,
  LoadOrdersByStatus,
  CreateOrder,
  UpdateOrder,
  AssignAgent,
  AssignOrder,
  MarkDelivered,
  MarkDueCollected,
  RecordPayment,
  MarkBackorderPurchased,
  SelectOrder,
  SetLoading,
  SetError,
  FilterOrdersByStatus,
  FilterOrdersByClient,
  FilterOrdersByAssignedTo,
  FilterOrdersByAssignmentType,
  FilterOrdersByDeliveryStatus,
  FilterOrdersByPaymentStatus,
  LoadOrderStatusCounts,
  LoadSalesDashboard,
} from './order.actions';
import { catchError, tap, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { ResetAllStores } from '../actions/store.actions';
import { DecreaseStockBulk } from '../item-store/item.actions';
import { CoreService } from 'src/app/services/capacitor/core.service';
import { ActionOptions } from '../api-response';

const defaults: OrderStateModel = {
  orders: [],
  pagination: {
    page: 1,
    pages: 0,
    totalCount: 0,
    hasMore: false,
  },
  userOrders: [],
  selectedOrder: null,
  loading: false,
  error: null,
  filterCriteria: {},
  statusCounts: {
    createdCount: 0,
    assignedCount: 0,
    completedCount: 0,
    backorderCount: 0,
    totalOrderCount: 0,
  },
  dynamicPagination: null,
};

@State<OrderStateModel>({
  name: 'orders',
  defaults,
})
@Injectable({
  providedIn: 'root',
})
export class OrderState {
  constructor(
    private orderService: OrderService,
    private router: Router,
    private store: Store,
    private coreService: CoreService,
  ) {}

  // ============ ACTIONS ============
  @Action(LoadOrders)
  async loadOrders(ctx: StateContext<OrderStateModel>, action: LoadOrders) {
    const { isLoading = false } = action.options || {};

    if (isLoading) await this.coreService.showLoading();

    const oldPagination = ctx.getState().dynamicPagination ?? {};
    const state = action.payload.page === 1 ? [] : ctx.getState().orders;
    ctx.patchState({ loading: true });
    return this.orderService.getAllOrders(action.payload, action.filter).pipe(
      tap((res) => {
        const orders = res.data;
        const pagination = res.pagination || {
          page: 1,
          totalCount: orders.length,
          hasMore: false,
          pages: 1,
        };
        ctx.patchState({
          orders: [...state, ...orders],
          pagination,
          dynamicPagination: {
            ...oldPagination,
            ['orders']: pagination,
          },
          loading: false,
          error: null,
        });
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message,
        });
        return of([]);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      }),
    );
  }

  @Action(LoadOrderById)
  async loadOrderById(
    ctx: StateContext<OrderStateModel>,
    action: LoadOrderById,
  ) {
     const options: ActionOptions = action.options || { isLoading: false };
    const isLoading = options.isLoading ?? false;
    
    ctx.patchState({ loading: true });
    if (isLoading) await this.coreService.showLoading();

    return this.orderService.getOrderById(action.payload).pipe(
      tap((res) => {
        const order = res.data;
        ctx.patchState({
          selectedOrder: order,
          loading: false,
          error: null,
        });
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message,
        });
        return of(null);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      }),
    );
  }

  @Action(LoadOrdersByClient)
  async loadOrdersByClient(
    ctx: StateContext<OrderStateModel>,
    action: LoadOrdersByClient,
  ) {
    const { isLoading = false } = action.options || {};

    if (isLoading) await this.coreService.showLoading();

    ctx.patchState({ loading: true });
    return this.orderService.getOrdersByClient(action.payload).pipe(
      tap((res) => {
        const orders = res.data;
        ctx.patchState({
          orders,
          loading: false,
          error: null,
        });
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message,
        });
        return of([]);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      }),
    );
  }

  @Action(LoadOrdersByStatus)
  async loadOrdersByStatus(
    ctx: StateContext<OrderStateModel>,
    action: LoadOrdersByStatus,
  ) {
    const { isLoading = false } = action.options || {};

    if (isLoading) await this.coreService.showLoading();

    ctx.patchState({ loading: true });
    return this.orderService.getOrdersByStatus(action.payload).pipe(
      tap((res) => {
        const orders = res.data;
        ctx.patchState({
          orders,
          loading: false,
          error: null,
        });
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message,
        });
        return of([]);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      }),
    );
  }

  @Action(CreateOrder)
  async createOrder(ctx: StateContext<OrderStateModel>, action: CreateOrder) {
    const {
      isLoading = false,
      showToast = false,
      successMessage,
      errorMessage,
    } = action.options || {};

    if (isLoading) await this.coreService.showLoading();

    ctx.patchState({ loading: true });
    return this.orderService.createOrder(action.payload).pipe(
      tap((res) => {
        const order = res.data;
        const state = ctx.getState();
        ctx.patchState({
          orders: [...state.orders, order],
          loading: false,
          error: null,
        });

        if (showToast) {
          this.coreService.showSuccessToast(
            successMessage || 'Order created successfully',
          );
        }

        ctx.dispatch(new DecreaseStockBulk(action.payload.items));
        // Navigate to order details page based on user role
        const userRole = this.store.selectSignal(selectUserRole)();
        switch (userRole) {
          case 'owner':
            this.router.navigate(['/owner/orders', order._id]);
            break;
          case 'sales_person':
            this.router.navigate(['/sales/orders', order._id]);
            break;
          case 'delivery_agent':
            this.router.navigate(['/delivery/orders/details', order._id]);
            break;
          default:
            this.router.navigate(['/login']);
        }
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message,
        });

        if (showToast) {
          this.coreService.showErrorToast(errorMessage || error.message);
        }

        return of(null);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      }),
    );
  }

  @Action(UpdateOrder)
  async updateOrder(ctx: StateContext<OrderStateModel>, action: UpdateOrder) {
    const {
      isLoading = false,
      showToast = false,
      successMessage,
      errorMessage,
    } = action.options || {};

    if (isLoading) await this.coreService.showLoading();

    ctx.patchState({ loading: true });
    return this.orderService
      .updateOrder(action.payload.id, action.payload.data)
      .pipe(
        tap((res) => {
          const updatedOrder = res.data;
          const state = ctx.getState();
          ctx.patchState({
            orders: state.orders.map((order) =>
              order._id === updatedOrder._id ? updatedOrder : order,
            ),
            selectedOrder:
              state.selectedOrder?._id === updatedOrder._id
                ? updatedOrder
                : state.selectedOrder,
            loading: false,
            error: null,
          });

          if (showToast) {
            this.coreService.showSuccessToast(
              successMessage || 'Order updated successfully',
            );
          }
        }),
        catchError((error) => {
          ctx.patchState({
            loading: false,
            error: error.message,
          });

          if (showToast) {
            this.coreService.showErrorToast(errorMessage || error.message);
          }

          return of(null);
        }),
        finalize(async () => {
          if (isLoading) {
            await this.coreService.hideLoading();
          }
        }),
      );
  }

  @Action(AssignAgent)
  async assignAgent(ctx: StateContext<OrderStateModel>, action: AssignAgent) {
    const {
      isLoading = false,
      showToast = false,
      successMessage,
      errorMessage,
    } = action.options || {};

    if (isLoading) await this.coreService.showLoading();

    ctx.patchState({ loading: true });
    return this.orderService
      .assignAgent(action.payload.orderId, action.payload.agentId)
      .pipe(
        tap((res) => {
          const updatedOrder = res.data;
          const state = ctx.getState();
          ctx.patchState({
            orders: state.orders.map((order) =>
              order._id === updatedOrder._id ? updatedOrder : order,
            ),
            selectedOrder:
              state.selectedOrder?._id === updatedOrder._id
                ? updatedOrder
                : state.selectedOrder,
            loading: false,
            error: null,
          });

          if (showToast) {
            this.coreService.showSuccessToast(
              successMessage || 'Agent assigned successfully',
            );
          }
        }),
        catchError((error) => {
          ctx.patchState({
            loading: false,
            error: error.message,
          });

          if (showToast) {
            this.coreService.showErrorToast(errorMessage || error.message);
          }

          return of(null);
        }),
        finalize(async () => {
          if (isLoading) {
            await this.coreService.hideLoading();
          }
        }),
      );
  }

  // ============ NEW ASSIGNMENT HANDLERS ============
  @Action(AssignOrder)
  async assignOrder(ctx: StateContext<OrderStateModel>, action: AssignOrder) {
    const {
      isLoading = false,
      showToast = false,
      successMessage,
      errorMessage,
    } = action.options || {};

    if (isLoading) await this.coreService.showLoading();

    ctx.patchState({ loading: true });
    return this.orderService
      .assignOrder(
        action.payload.orderId,
        action.payload.salesPersonId,
        action.payload.assignFor,
      )
      .pipe(
        tap((res) => {
          const updatedOrder = res.data;
          const state = ctx.getState();
          ctx.patchState({
            orders: state.orders.map((order) =>
              order._id === updatedOrder._id ? updatedOrder : order,
            ),
            selectedOrder:
              state.selectedOrder?._id === updatedOrder._id
                ? updatedOrder
                : state.selectedOrder,
            loading: false,
            error: null,
          });

          if (showToast) {
            this.coreService.showSuccessToast(
              successMessage || 'Order assigned successfully',
            );
          }
        }),
        catchError((error) => {
          ctx.patchState({
            loading: false,
            error: error.message,
          });

          if (showToast) {
            this.coreService.showErrorToast(errorMessage || error.message);
          }

          return of(null);
        }),
        finalize(async () => {
          if (isLoading) {
            await this.coreService.hideLoading();
          }
        }),
      );
  }

  @Action(MarkDelivered)
  async markDelivered(
    ctx: StateContext<OrderStateModel>,
    action: MarkDelivered,
  ) {
    const {
      isLoading = false,
      showToast = false,
      successMessage,
      errorMessage,
    } = action.options || {};

    if (isLoading) await this.coreService.showLoading();

    ctx.patchState({ loading: true });
    return this.orderService.markDelivered(action.payload).pipe(
      tap((res) => {
        const updatedOrder = res.data;
        const state = ctx.getState();
        ctx.patchState({
          orders: state.orders.map((order) =>
            order._id === updatedOrder._id
              ? {
                  ...order,
                  isDelivered: updatedOrder.isDelivered,
                  deliveredAt: updatedOrder.deliveredAt,
                  assignedFor: updatedOrder.assignedFor,
                }
              : order,
          ),
          selectedOrder:
            state.selectedOrder?._id === updatedOrder._id
              ? {
                  ...state.selectedOrder,
                  isDelivered: updatedOrder.isDelivered,
                  deliveredAt: updatedOrder.deliveredAt,
                  assignedFor: updatedOrder.assignedFor,
                } as Order
              : state.selectedOrder,
          loading: false,
          error: null,
        });

        if (showToast) {
          this.coreService.showSuccessToast(
            successMessage || 'Order marked as delivered',
          );
        }
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message,
        });

        if (showToast) {
          this.coreService.showErrorToast(errorMessage || error.message);
        }

        return of(null);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      }),
    );
  }

  @Action(MarkDueCollected)
  async markDueCollected(
    ctx: StateContext<OrderStateModel>,
    action: MarkDueCollected,
  ) {
    const {
      isLoading = false,
      showToast = false,
      successMessage,
      errorMessage,
    } = action.options || {};

    if (isLoading) await this.coreService.showLoading();

    ctx.patchState({ loading: true });
    return this.orderService.markDueCollected(action.payload).pipe(
      tap((res) => {
        const updatedOrder = res.data;
        const state = ctx.getState();
        ctx.patchState({
          orders: state.orders.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order,
          ),
          selectedOrder:
            state.selectedOrder?._id === updatedOrder._id
              ? updatedOrder
              : state.selectedOrder,
          loading: false,
          error: null,
        });

        if (showToast) {
          this.coreService.showSuccessToast(
            successMessage || 'Due collected successfully',
          );
        }
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message,
        });

        if (showToast) {
          this.coreService.showErrorToast(errorMessage || error.message);
        }

        return of(null);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      }),
    );
  }

  @Action(RecordPayment)
  async recordPayment(
    ctx: StateContext<OrderStateModel>,
    action: RecordPayment,
  ) {
    const {
      isLoading = false,
      showToast = false,
      successMessage,
      errorMessage,
    } = action.options || {};

    if (isLoading) await this.coreService.showLoading();

    ctx.patchState({ loading: true });
    return this.orderService
      .recordPayment(action.payload.orderId, action.payload.data)
      .pipe(
        tap((res: any) => {
          const updatedOrder = res.data;
          const state = ctx.getState();
          ctx.patchState({
            orders: state.orders.map((order) =>
              order._id === updatedOrder._id ? updatedOrder : order,
            ),
            selectedOrder:
              state.selectedOrder?._id === updatedOrder._id
                ? updatedOrder
                : state.selectedOrder,
            loading: false,
            error: null,
          });

          if (showToast) {
            this.coreService.showSuccessToast(
              successMessage || 'Payment recorded successfully',
            );
          }
        }),
        catchError((error) => {
          ctx.patchState({
            loading: false,
            error: error.message,
          });

          if (showToast) {
            this.coreService.showErrorToast(errorMessage || error.message);
          }

          return of(null);
        }),
        finalize(async () => {
          if (isLoading) {
            await this.coreService.hideLoading();
          }
        }),
      );
  }

  @Action(MarkBackorderPurchased)
  async markBackorderPurchased(
    ctx: StateContext<OrderStateModel>,
    action: MarkBackorderPurchased,
  ) {
    const {
      isLoading = false,
      showToast = false,
      successMessage,
      errorMessage,
    } = action.options || {};

    if (isLoading) await this.coreService.showLoading();

    ctx.patchState({ loading: true });
    return this.orderService.markBackorderPurchased(action.payload).pipe(
      tap((res) => {
        const updatedOrder = res.data;
        const state = ctx.getState();
        ctx.patchState({
          orders: state.orders.map((order) =>
            order._id === updatedOrder._id ? updatedOrder : order,
          ),
          selectedOrder:
            state.selectedOrder?._id === updatedOrder._id
              ? updatedOrder
              : state.selectedOrder,
          loading: false,
          error: null,
        });

        if (showToast) {
          this.coreService.showSuccessToast(
            successMessage || 'Backorder marked as purchased',
          );
        }
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message,
        });

        if (showToast) {
          this.coreService.showErrorToast(errorMessage || error.message);
        }

        return of(null);
      }),
      finalize(async () => {
        if (isLoading) {
          await this.coreService.hideLoading();
        }
      }),
    );
  }

  @Action(SelectOrder)
  selectOrder(ctx: StateContext<OrderStateModel>, action: SelectOrder) {
    if (action.payload) {
      // Get order from existing state
      const state = ctx.getState();
      const order = state.orders.find((o) => o._id === action.payload);
      ctx.patchState({ selectedOrder: order || null });
    } else {
      ctx.patchState({ selectedOrder: null });
    }
  }

  @Action(SetLoading)
  setLoading(ctx: StateContext<OrderStateModel>, action: SetLoading) {
    ctx.patchState({ loading: action.payload });
  }

  @Action(SetError)
  setError(ctx: StateContext<OrderStateModel>, action: SetError) {
    ctx.patchState({ error: action.payload });
  }

  @Action(LoadOrderStatusCounts)
  loadOrderStatusCounts(ctx: StateContext<OrderStateModel>) {
    ctx.patchState({ loading: true });
    return this.orderService.getOrderStatusCounts().pipe(
      tap((counts) => {
        ctx.patchState({
          statusCounts: counts,
          loading: false,
        });
      }),
      catchError((err) => {
        ctx.patchState({ error: err.message, loading: false });
        return of(null);
      }),
    );
  }

  @Action(FilterOrdersByStatus)
  filterByStatus(
    ctx: StateContext<OrderStateModel>,
    action: FilterOrdersByStatus,
  ) {
    ctx.patchState({
      filterCriteria: {
        ...ctx.getState().filterCriteria,
        orderStatus: action.payload as any,
      },
    });
  }

  @Action(FilterOrdersByClient)
  filterByClient(
    ctx: StateContext<OrderStateModel>,
    action: FilterOrdersByClient,
  ) {
    ctx.patchState({
      filterCriteria: {
        ...ctx.getState().filterCriteria,
        clientId: action.payload,
      },
    });
  }

  // ============ ADVANCED FILTER HANDLERS ============
  @Action(FilterOrdersByAssignedTo)
  filterByAssignedTo(
    ctx: StateContext<OrderStateModel>,
    action: FilterOrdersByAssignedTo,
  ) {
    ctx.patchState({
      filterCriteria: {
        ...ctx.getState().filterCriteria,
        assignedTo: action.payload,
      },
    });
  }

  @Action(FilterOrdersByAssignmentType)
  filterByAssignmentType(
    ctx: StateContext<OrderStateModel>,
    action: FilterOrdersByAssignmentType,
  ) {
    ctx.patchState({
      filterCriteria: {
        ...ctx.getState().filterCriteria,
        assignedFor: action.payload,
      },
    });
  }

  @Action(FilterOrdersByDeliveryStatus)
  filterByDeliveryStatus(
    ctx: StateContext<OrderStateModel>,
    action: FilterOrdersByDeliveryStatus,
  ) {
    ctx.patchState({
      filterCriteria: {
        ...ctx.getState().filterCriteria,
        isDelivered: action.payload,
      },
    });
  }

  @Action(FilterOrdersByPaymentStatus)
  filterByPaymentStatus(
    ctx: StateContext<OrderStateModel>,
    action: FilterOrdersByPaymentStatus,
  ) {
    ctx.patchState({
      filterCriteria: {
        ...ctx.getState().filterCriteria,
        paymentStatus: action.payload,
      },
    });
  }

  @Action(LoadSalesDashboard)
  loadSalesDashboard(ctx: StateContext<OrderStateModel>) {
    ctx.patchState({ loading: true });
    return this.orderService.getSalesDashboardData().pipe(
      tap((res) => {
        ctx.patchState({
          salesDashboardData: res.data,
          loading: false,
          error: null,
        });
      }),
      catchError((error) => {
        ctx.patchState({
          loading: false,
          error: error.message,
        });
        return of(null);
      }),
    );
  }

  @Action(ResetAllStores)
  resetAllStores(ctx: StateContext<OrderStateModel>) {
    ctx.setState(defaults);
  }
}
