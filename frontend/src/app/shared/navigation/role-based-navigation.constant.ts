/**
 * Role-Based Navigation Routes
 * 
 * This constant defines all navigation routes organized by user roles.
 * Use these constants instead of hardcoding route strings throughout the application.
 * 
 * Roles:
 * - owner: Store owner/manager
 * - sales_person: Sales personnel
 * - delivery_agent: Delivery/logistics personnel
 */

export const ROLE_BASED_ROUTES = {
  OWNER: {
    DASHBOARD: '/owner/dashboard',
    ORDERS: '/owner/orders',
    ORDER_DETAIL: (id: string) => `/owner/orders/${id}`,
    CREATE_ORDER: '/owner/create-order',
    ASSIGN_AGENT: (id: string) => `/owner/order-assign-agent/${id}`,
    RECORD_PAYMENT: (id: string) => `/owner/order-record-payment/${id}`,
    BACKORDER_PURCHASED: (id: string) => `/owner/order-backorder-purchased/${id}`,
  },
  SALES_PERSON: {
    DASHBOARD: '/sales/dashboard',
    ORDERS: '/sales/orders',
    ORDER_DETAIL: (id: string) => `/sales/orders/${id}`,
    CREATE_ORDER: '/sales/create-order',
    ASSIGN_AGENT: (id: string) => `/sales/order-assign-agent/${id}`,
  },
  DELIVERY_AGENT: {
    DASHBOARD: '/delivery/dashboard',
    ORDERS: '/delivery/orders',
    ORDER_DETAIL: (id: string) => `/delivery/orders/${id}`,
    RECORD_PAYMENT: (id: string) => `/delivery/order-record-payment/${id}`,
  },
  PUBLIC: {
    LOGIN: '/login',
  },
};

/**
 * Helper function to get navigation route based on role
 * 
 * @param role User role (owner, sales_person, delivery_agent)
 * @returns Navigation route for orders list
 */
export function getOrdersRoute(role: string | null): string {
  switch (role) {
    case 'owner':
      return ROLE_BASED_ROUTES.OWNER.ORDERS;
    case 'sales_person':
      return ROLE_BASED_ROUTES.SALES_PERSON.ORDERS;
    case 'delivery_agent':
      return ROLE_BASED_ROUTES.DELIVERY_AGENT.ORDERS;
    default:
      return ROLE_BASED_ROUTES.PUBLIC.LOGIN;
  }
}

/**
 * Get order detail route based on role
 */
export function getOrderDetailRoute(role: string | null, id: string): string {
  switch (role) {
    case 'owner':
      return ROLE_BASED_ROUTES.OWNER.ORDER_DETAIL(id);
    case 'sales_person':
      return ROLE_BASED_ROUTES.SALES_PERSON.ORDER_DETAIL(id);
    case 'delivery_agent':
      return ROLE_BASED_ROUTES.DELIVERY_AGENT.ORDER_DETAIL(id);
    default:
      return ROLE_BASED_ROUTES.PUBLIC.LOGIN;
  }
}

/**
 * Get assign agent route based on role
 */
export function getAssignAgentRoute(role: string | null, id: string): string {
  switch (role) {
    case 'owner':
      return ROLE_BASED_ROUTES.OWNER.ASSIGN_AGENT(id);
    case 'sales_person':
      return ROLE_BASED_ROUTES.SALES_PERSON.ASSIGN_AGENT(id);
    default:
      return ROLE_BASED_ROUTES.PUBLIC.LOGIN;
  }
}

/**
 * Get record payment route based on role
 */
export function getRecordPaymentRoute(role: string | null, id: string): string {
  switch (role) {
    case 'owner':
      return ROLE_BASED_ROUTES.OWNER.RECORD_PAYMENT(id);
    case 'delivery_agent':
      return ROLE_BASED_ROUTES.DELIVERY_AGENT.RECORD_PAYMENT(id);
    default:
      return ROLE_BASED_ROUTES.PUBLIC.LOGIN;
  }
}

/**
 * Get create order route based on role
 */
export function getCreateOrderRoute(role: string | null): string {
  switch (role) {
    case 'owner':
      return ROLE_BASED_ROUTES.OWNER.CREATE_ORDER;
    case 'sales_person':
      return ROLE_BASED_ROUTES.SALES_PERSON.CREATE_ORDER;
    default:
      return ROLE_BASED_ROUTES.PUBLIC.LOGIN;
  }
}
