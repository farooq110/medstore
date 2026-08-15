import { apiClient } from "../lib/api-client"
import { Item, ApiResponse, PaginatedResponse } from "../types"

export const itemService = {
  async getItems(params?: { search?: string; category?: string; categoryIds?: string[]; page?: number; limit?: number }): Promise<PaginatedResponse<Item>> {
    const response = await apiClient.get<PaginatedResponse<Item>>("/items", { params })
    return response.data
  },

  async getItemById(id: string): Promise<ApiResponse<Item>> {
    const response = await apiClient.get<ApiResponse<Item>>(`/items/${id}`)
    return response.data
  },

  async getLowStockItems(): Promise<ApiResponse<Item[]>> {
    const response = await apiClient.get<ApiResponse<Item[]>>("/items/low-stock")
    return response.data
  },

  async getExpiringSoonItems(): Promise<ApiResponse<Item[]>> {
    const response = await apiClient.get<ApiResponse<Item[]>>("/items/expiring-soon")
    return response.data
  },

  async createItem(data: Partial<Item>): Promise<ApiResponse<Item>> {
    const response = await apiClient.post<ApiResponse<Item>>("/items", data)
    return response.data
  },

  async updateItem(id: string, data: Partial<Item>): Promise<ApiResponse<Item>> {
    const response = await apiClient.put<ApiResponse<Item>>(`/items/${id}`, data)
    return response.data
  },

  async deleteItem(id: string): Promise<ApiResponse<Item>> {
    const response = await apiClient.delete<ApiResponse<Item>>(`/items/${id}`)
    return response.data
  },
}
