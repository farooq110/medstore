import { FilterParams, PaginationParams, ActionOptions } from '../api-response';
import { OrderFilterParams } from './order.service';
import { Order } from './order.model';

// Load Actions
export class LoadOrders {
  static readonly type = '[Order] Load Orders';
  constructor(public payload: PaginationParams, public filter?: OrderFilterParams, public options?: ActionOptions) {}
}

export class LoadOrderById {
  static readonly type = '[Order] Load Order By ID';
  constructor(public payload: string, public options?: ActionOptions) {}
}

export class LoadOrdersByClient {
  static readonly type = '[Order] Load Orders By Client';
  constructor(public payload: string, public options?: ActionOptions) {} // clientId
}

export class LoadOrdersByStatus {
  static readonly type = '[Order] Load Orders By Status';
  constructor(public payload: string, public options?: ActionOptions) {} // status
}

// Create & Update Actions
export class CreateOrder {
  static readonly type = '[Order] Create Order';
  constructor(public payload: any, public options?: ActionOptions) {}
}

export class UpdateOrder {
  static readonly type = '[Order] Update Order';
  constructor(public payload: { id: string; data: any }, public options?: ActionOptions) {}
}

// Order Status Actions
export class AssignOrder {
  static readonly type = '[Order] Assign Order';
  constructor(
    public payload: {
      orderId: string;
      salesPersonId: string;
      assignFor: "delivery" | "payment_collection";
    },
    public options?: ActionOptions
  ) {}
}

export class AssignAgent {
  static readonly type = '[Order] Assign Agent';
  constructor(public payload: { orderId: string; agentId: string }, public options?: ActionOptions) {}
}

export class MarkDelivered {
  static readonly type = '[Order] Mark Delivered';
  constructor(public payload: string, public options?: ActionOptions) {} // orderId
}

export class MarkDueCollected {
  static readonly type = '[Order] Mark Due Collected';
  constructor(public payload: string, public options?: ActionOptions) {} // orderId
}

export class RecordPayment {
  static readonly type = '[Order] Record Payment';
  constructor(public payload: { orderId: string; data: any }, public options?: ActionOptions) {}
}

export class MarkBackorderPurchased {
  static readonly type = '[Order] Mark Backorder Purchased';
  constructor(public payload: string, public options?: ActionOptions) {} // orderId
}

// Selection & Filter Actions
export class SelectOrder {
  static readonly type = '[Order] Select Order';
  constructor(public payload: string | null) {} // orderId
}

export class FilterOrdersByStatus {
  static readonly type = '[Order] Filter Orders By Status';
  constructor(
    public payload: 'created' | 'assigned' | 'completed' | 'backorder'
  ) {}
}

export class FilterOrdersByClient {
  static readonly type = '[Order] Filter Orders By Client';
  constructor(public payload: string) {} // clientId
}

// ============ ADVANCED FILTER ACTIONS ============
export class FilterOrdersByAssignedTo {
  static readonly type = '[Order] Filter Orders By Assigned To';
  constructor(public payload: string) {} // salesPersonId
}

export class FilterOrdersByAssignmentType {
  static readonly type = '[Order] Filter Orders By Assignment Type';
  constructor(public payload: "delivery" | "payment_collection") {}
}

export class FilterOrdersByDeliveryStatus {
  static readonly type = '[Order] Filter Orders By Delivery Status';
  constructor(public payload: boolean) {} // isDelivered
}

export class FilterOrdersByPaymentStatus {
  static readonly type = '[Order] Filter Orders By Payment Status';
  constructor(
    public payload: "pending" | "partial" | "fully_paid" | "borrow"
  ) {}
}

// State Management Actions
export class SetLoading {
  static readonly type = '[Order] Set Loading';
  constructor(public payload: boolean) {}
}

export class SetError {
  static readonly type = '[Order] Set Error';
  constructor(public payload: string | null) {}
}

// Order Statistics Actions
export class LoadOrderStatusCounts {
  static readonly type = '[Order] Load Order Status Counts';
}

export class LoadSalesDashboard {
  static readonly type = '[Order] Load Sales Dashboard';
}
