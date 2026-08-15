import { apiClient } from "../lib/api-client"
import { Client, ApiResponse, PaginatedResponse, ClientDetailData } from "../types"
import { useQuery } from "@tanstack/react-query"

export const clientService = {
  async getClients(params?: { search?: string; page?: number; limit?: number }): Promise<PaginatedResponse<Client>> {
    const response = await apiClient.get<PaginatedResponse<Client>>("/clients", { params })
    return response.data
  },

  async getClientById(id: string): Promise<ApiResponse<Client>> {
    const response = await apiClient.get<ApiResponse<Client>>(`/clients/${id}`)
    return response.data
  },

  async getClientDetail(id: string): Promise<ApiResponse<ClientDetailData>> {
    const response = await apiClient.get<ApiResponse<ClientDetailData>>(`/clients/${id}/detail`)
    return response.data
  },

  async getClientDues(id: string): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>(`/clients/${id}/dues`)
    return response.data
  },

  async createClient(data: Partial<Client>): Promise<ApiResponse<Client>> {
    const response = await apiClient.post<ApiResponse<Client>>("/clients", data)
    return response.data
  },

  async updateClient(id: string, data: Partial<Client>): Promise<ApiResponse<Client>> {
    const response = await apiClient.put<ApiResponse<Client>>(`/clients/${id}`, data)
    return response.data
  },
}
