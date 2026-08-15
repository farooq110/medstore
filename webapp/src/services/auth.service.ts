import { apiClient } from "../lib/api-client"
import { Business, User } from "../types"

interface LoginResponse {
  success: boolean
  message: string
  data: {
    token: string
    user: User
    business: Business
  }
}

interface AuthMeResponse {
  success: boolean
  data: User
}

interface RegisterPayload {
  name: string
  email: string
  password: string
  phone: string
  businessName: string
  country: string
  businessPhone?: string
  businessAddress?: string
  website?: string
}

export const authService = {
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/login", {
      email,
      password,
    })
    return response.data
  },

  async register(data: RegisterPayload): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>("/auth/register", data)
    return response.data
  },

  async getMe(): Promise<AuthMeResponse> {
    const response = await apiClient.get<AuthMeResponse>("/auth/me")
    return response.data
  },

  async resetPassword(token: string, password: string): Promise<any> {
    const response = await apiClient.post("/auth/reset-password", { token, password })
    return response.data
  },

  async forgotPassword(email: string): Promise<any> {
    const response = await apiClient.post("/auth/forgot-password", { email })
    return response.data
  },

  async updateProfile(data: any): Promise<any> {
    const response = await apiClient.patch("/auth/profile", data)
    return response.data
  },

  async updateBusiness(data: any): Promise<any> {
    const response = await apiClient.patch("/business", data)
    return response.data
  },
}
