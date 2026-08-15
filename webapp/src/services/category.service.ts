import { apiClient } from "../lib/api-client"
import { Category, PaginatedResponse } from "../types"

export const categoryService = {
  async getCategories(params?: { page?: number; limit?: number; search?: string; status?: string }): Promise<PaginatedResponse<Category>> {
    const response = await apiClient.get<PaginatedResponse<Category>>("/categories", { params })
    return response.data
  },

  async createCategory(data: Partial<Category>): Promise<Category> {
    const response = await apiClient.post<{ data: Category }>("/categories", data)
    return response.data.data
  },

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    const response = await apiClient.put<{ data: Category }>(`/categories/${id}`, data)
    return response.data.data
  },

  async deleteCategory(id: string): Promise<void> {
    await apiClient.delete(`/categories/${id}`)
  },
}
