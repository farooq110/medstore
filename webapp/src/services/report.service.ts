import { apiClient } from "../lib/api-client"
import { ApiResponse } from "../types"

export const reportService = {
  async getOutstandingDues(params: { page: number; limit: number }): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>("/reports/outstanding-dues", { params })
    return response.data
  },

  async getCollections(params: { startDate: string; endDate: string; page: number; limit: number }): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>("/reports/collections", { params })
    return response.data
  },

  async getSalesPersonReport(): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>("/reports/sales-person")
    return response.data
  },

  async getExpiryReport(params: { status: "all" | "expired" | "expiring_soon"; page: number; limit: number }): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>("/reports/expiry", { params })
    return response.data
  },

  async getStockReport(params: { filter: "all" | "low_stock" | "out_of_stock"; page: number; limit: number }): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>("/reports/stock", { params })
    return response.data
  },

  async getRevenueReport(params: { year: number; month: number | "ALL" }): Promise<ApiResponse<any>> {
    const response = await apiClient.get<ApiResponse<any>>("/reports/revenue", { params })
    return response.data
  },
}
