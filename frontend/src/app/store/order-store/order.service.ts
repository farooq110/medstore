import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Order, CreateOrderDto, UpdateOrderDto, RecordPaymentDto, OrderStatusCounts } from './order.model';
import { ApiResponse, FilterParams, PaginationParams } from '../api-response';
import { HttpService } from 'src/app/services/http/http-service';

/**
 * Filter params specific to getAllOrders
 * All filter parameters are dynamically appended to the query string and sent to the backend
 * The backend handles the filtering and returns filtered results
 */
export interface OrderFilterParams {
  search?: string;                    // Search by order number
  paymentStatus?: string | string[];  // Filter by payment status (single or multiple: pending, partial, fully_paid, borrow)
  status?: string;                    // Filter by order status (created, assigned, completed)
  clientId?: string;                  // Filter by client ID - backward compatible with backend
  sortBy?: any;
}

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private readonly httpService = inject(HttpService);

  /**
   * Get all orders (filtered by role and multi-tenant: business ID) with pagination and filtering
   * Sales persons see only their assigned orders
   */
  public getAllOrders = (payload: PaginationParams, filter?: OrderFilterParams): Observable<ApiResponse<Order[]>> => {
    const params = new URLSearchParams();
    params.append('page', payload.page.toString());
    if (payload.limit) {
      params.append('limit', payload.limit.toString());
    }

    if (filter) {
      Object.entries(filter).forEach(([key, value]) => {
        if (key === 'sortBy' && Array.isArray(value)) {
          value.forEach((sort) => params.append('sortBy', sort));
        } else if (Array.isArray(value)) {
          value.forEach((v) => params.append(key, v));
        } else if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });
    }

    return this.httpService.get<ApiResponse<Order[]>>(`orders?${params.toString()}`, {
      cache: true,
    });
  };

  /**
   * Get orders by client
   */
  public getOrdersByClient = (clientId: string): Observable<ApiResponse<Order[]>> => {
    const params = new URLSearchParams({
      clientId,
    });

    return this.httpService.get<ApiResponse<Order[]>>(`orders?${params.toString()}`, {
      cache: true,
    });
  };

  /**
   * Get orders by status
   */
  public getOrdersByStatus = (status: string): Observable<ApiResponse<Order[]>> => {
    const params = new URLSearchParams({
      status,
    });

    return this.httpService.get<ApiResponse<Order[]>>(`orders?${params.toString()}`, {
      cache: true,
    });
  };

  /**
   * Get order by ID
   */
  public getOrderById = (id: string): Observable<ApiResponse<Order>> => {
    return this.httpService.get<ApiResponse<Order>>(`orders/${id}`, {
      cache: true,
    });
  };

  /**
   * Create new order
   */
  public createOrder = (dto: CreateOrderDto): Observable<ApiResponse<Order>> => {
    return this.httpService.post<ApiResponse<Order>>(
      'orders',
      dto,
      {
        revalidatePatterns: ['*/orders*','*/users*', '*product*', '*/items*', '*dashboard/summary*', '*reports*'],
      }
    );
  };

  /**
   * Update order
   */
  public updateOrder = (id: string, dto: UpdateOrderDto): Observable<ApiResponse<Order>> => {
    return this.httpService.put<ApiResponse<Order>>(
      `orders/${id}`,
      dto,
      {
        revalidatePatterns: ['*/orders*', '*/users*', '*product*', '*/items*', '*dashboard/summary*', '*reports*'],
      }
    );
  };

  /**
   * Assign delivery agent (legacy)
   */
  public assignAgent = (orderId: string, agentId: string): Observable<ApiResponse<Order>> => {
    return this.httpService.put<ApiResponse<Order>>(
      `orders/${orderId}/assign`,
      { agentId },
      {
        revalidatePatterns: ['*/orders*', '*/users*'],
      }
    );
  };

  /**
   * Assign order to sales person for specific task
   */
  public assignOrder = (orderId: string, salesPersonId: string, assignFor: "delivery" | "payment_collection"): Observable<ApiResponse<Order>> => {
    return this.httpService.put<ApiResponse<Order>>(
      `orders/${orderId}/assign`,
      { salesPersonId, assignFor },
      {
        revalidatePatterns: ['*/orders*', '*/users*'],
      }
    );
  };

  /**
   * Mark items as delivered
   */
  public markDelivered = (orderId: string): Observable<ApiResponse<Order>> => {
    return this.httpService.put<ApiResponse<Order>>(
      `orders/${orderId}/mark-delivered`,
      {},
      {
        revalidatePatterns: ['*/orders*', '*/users*', '*dashboard/summary*', '*reports*'],
      }
    );
  };

  /**
   * Mark due as collected
   */
  public markDueCollected = (orderId: string): Observable<ApiResponse<Order>> => {
    return this.httpService.put<ApiResponse<Order>>(
      `orders/${orderId}/mark-due-collected`,
      {},
      {
        revalidatePatterns: ['*/orders*', '*/users*', '*dashboard/summary*', '*reports*'],
      }
    );
  };

  /**
   * Mark items as provided (legacy endpoint)
   */
  public markItemsProvided = (orderId: string): Observable<ApiResponse<Order>> => {
    return this.httpService.put<ApiResponse<Order>>(
      `orders/${orderId}/items-provided`,
      {},
      {
        revalidatePatterns: ['*/orders*', '*/users*', '*product*', '*/items*', '*dashboard/summary*'],
      }
    );
  };

  /**
   * Record payment
   */
  public recordPayment = (orderId: string, dto: RecordPaymentDto): Observable<ApiResponse<Order>> => {
    return this.httpService.put<ApiResponse<Order>>(
      `orders/${orderId}/payment`,
      dto,
      {
        revalidatePatterns: ['*/orders*', '*/users*', '*dashboard/summary*', '*reports*'],
      }
    );
  };

  /**
   * Mark backorder as purchased
   */
  public markBackorderPurchased = (orderId: string): Observable<ApiResponse<Order>> => {
    return this.httpService.put<ApiResponse<Order>>(
      `orders/${orderId}/backorder-purchased`,
      {},
      {
        revalidatePatterns: ['*/orders*', '*/users*', '*product*', '*/items*', '*dashboard/summary*'],
      }
    );
  };

  /**
   * Get order status counts
   */
  public getOrderStatusCounts = (): Observable<OrderStatusCounts> => {
    return this.httpService
      .get<ApiResponse<OrderStatusCounts>>('/orders/statistics/status-counts',{
      cache: true,
    })
      .pipe(map((response) => response.data));
  };

  /**
   * Get sales dashboard data (recent orders, status counts, revenue, pending payment)
   */
  public getSalesDashboardData = (): Observable<any> => {
    return this.httpService.get<any>('/orders/dashboard/sales', {
      cache: false,
    });
  };
}
