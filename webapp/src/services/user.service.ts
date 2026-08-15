import { apiClient } from "../lib/api-client"
import { User, ApiResponse, PaginatedResponse } from "../types"
import { useQuery } from "@tanstack/react-query"

export const userService = {
  async getUsers(params?: { search?: string; page?: number; limit?: number }): Promise<PaginatedResponse<User>> {
    const response = await apiClient.get<PaginatedResponse<User>>("/users", { params })
    return response.data
  },

  async getUserById(id: string): Promise<ApiResponse<User>> {
    const response = await apiClient.get<ApiResponse<User>>(`/users/${id}`)
    return response.data
  },

  async createUser(data: Partial<User> & { password?: string }): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>("/users", data)
    return response.data
  },

  async updateUser(id: string, data: Partial<User>): Promise<ApiResponse<User>> {
    const response = await apiClient.put<ApiResponse<User>>(`/users/${id}`, data)
    return response.data
  },

  async getClientOptions(params?: { isAssigned?: string; page?: number; limit?: number }): Promise<PaginatedResponse<any>> {
    const response = await apiClient.get<PaginatedResponse<any>>("/users/client-options", { params })
    return response.data
  },

  async assignClients(salesPersonId: string, clientIds: string[]): Promise<ApiResponse<User>> {
    const response = await apiClient.post<ApiResponse<User>>(`/users/assign-clients/${salesPersonId}`, { clientIds })
    return response.data
  },

  async removeClient(clientId: string): Promise<ApiResponse<any>> {
    const response = await apiClient.delete<ApiResponse<any>>(`/users/remove-client/${clientId}`)
    return response.data
  },
}
