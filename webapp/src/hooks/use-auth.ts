import { create } from "zustand"
import { persist } from "zustand/middleware"
import { User } from "../types"
import { authService } from "../services/auth.service"

import { queryClient } from "../lib/query-client"

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isInitializing: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: any) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
  setIsInitializing: (isInitializing: boolean) => void
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isInitializing: true,
      login: async (email: string, password: string) => {
        const response = await authService.login(email, password)

        if (response.data && response.data.token) {
          localStorage.setItem("token", response.data.token)
          set({
            user: { ...response.data.user, business: response.data.business },
            token: response.data.token,
            isAuthenticated: true,
          })
        } else {
          throw new Error(response.message || "Login failed")
        }
      },
      register: async (data: any) => {
        const response = await authService.register(data)

        if (response.data && response.data.token) {
          localStorage.setItem("token", response.data.token)
          set({
            user: response.data.user,
            token: response.data.token,
            isAuthenticated: true,
          })
        } else {
          throw new Error(response.message || "Registration failed")
        }
      },
      logout: () => {
        localStorage.removeItem("token")
        queryClient.clear()
        set({ user: null, token: null, isAuthenticated: false })
      },
      setUser: (user: User) => set({ user, isAuthenticated: true }),
      setIsInitializing: (isInitializing: boolean) => set({ isInitializing }),
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
      }),
    }
  )
)
