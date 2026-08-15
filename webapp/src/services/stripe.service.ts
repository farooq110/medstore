import { apiClient } from "../lib/api-client"
import { Plan } from "../types"

export const stripeService = {
  async getPlans() {
    const response = await apiClient.get<{ success: boolean; data: Plan[] }>("/stripe/plans")
    return response.data
  },

  async createCheckoutSession(planId: string) {
    const response = await apiClient.post<{ success: boolean; data: { url: string } }>(
      "/stripe/create-checkout-session",
      { planId }
    )
    return response.data
  },
}
