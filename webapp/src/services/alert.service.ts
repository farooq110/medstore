import { apiClient } from "../lib/api-client"
import { Alert, ApiResponse } from "../types"

export const alertService = {
  async getAlerts(resolved: boolean = false): Promise<ApiResponse<Alert[]>> {
    const response = await apiClient.get<ApiResponse<Alert[]>>("/alerts", { params: { resolved } })
    return response.data
  },

  async markAlertSeen(id: string): Promise<ApiResponse<Alert>> {
    const response = await apiClient.put<ApiResponse<Alert>>(`/alerts/${id}/seen`, {})
    return response.data
  },

  async resolveAlert(id: string): Promise<ApiResponse<Alert>> {
    const response = await apiClient.put<ApiResponse<Alert>>(`/alerts/${id}/resolve`, {})
    return response.data
  },
}
