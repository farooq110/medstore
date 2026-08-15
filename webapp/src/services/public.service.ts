import axios from "axios"
import { Order, Business } from "../types"

const VITE_API_URL = import.meta.env.VITE_API_URL

export const publicService = {
  async getPublicOrder(id: string, token: string): Promise<{ order: Order; business: Business }> {
    const response = await axios.get(`${VITE_API_URL}/public/orders/${id}`, {
      params: { token }
    })
    return response.data.data
  }
}
