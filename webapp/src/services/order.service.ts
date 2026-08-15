import { apiClient } from "../lib/api-client"
import { Order, ApiResponse, OrderType, OrderStatus, PaginatedResponse } from "../types"

interface OrderFilters {
  status?: OrderStatus
  clientIds?: string[]
  type?: OrderType
  search?: string
  page?: number
  limit?: number
}

export const orderService = {
  async getOrders(filters?: OrderFilters): Promise<PaginatedResponse<Order>> {
    const response = await apiClient.get<PaginatedResponse<Order>>("/orders", { params: filters })
    return response.data
  },

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    const response = await apiClient.get<ApiResponse<Order>>(`/orders/${id}`)
    return response.data
  },

  async createOrder(data: any): Promise<ApiResponse<Order>> {
    const response = await apiClient.post<ApiResponse<Order>>("/orders", data)
    return response.data
  },

  async assignOrder(id: string, data: { salesPersonId: string; assignFor: "delivery" | "payment_collection" }): Promise<ApiResponse<Order>> {
    const response = await apiClient.put<ApiResponse<Order>>(`/orders/${id}/assign`, data)
    return response.data
  },

  async markItemsProvided(id: string): Promise<ApiResponse<Order>> {
    const response = await apiClient.put<ApiResponse<Order>>(`/orders/${id}/items-provided`, {})
    return response.data
  },

  async recordPayment(id: string, data: { amount: number; method: string; notes?: string }): Promise<ApiResponse<Order>> {
    const response = await apiClient.put<ApiResponse<Order>>(`/orders/${id}/payment`, data)
    return response.data
  },

  async markBackorderPurchased(id: string): Promise<ApiResponse<Order>> {
    const response = await apiClient.put<ApiResponse<Order>>(`/orders/${id}/backorder-purchased`, {})
    return response.data
  },
}
