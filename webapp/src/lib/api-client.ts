import axios from "axios"
import { useAuth } from "../hooks/use-auth"

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  paramsSerializer: (params) => {
    const searchParams = new URLSearchParams()
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined || value === null) continue
      
      if (Array.isArray(value)) {
        value.forEach(v => searchParams.append(`${key}[]`, v))
      } else {
        searchParams.append(key, value as string)
      }
    }
    return searchParams.toString()
  }
})

// Request interceptor for API calls
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for API calls
apiClient.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // If the error status is 401 and it's not a login request, log the user out
    if (
      error.response &&
      error.response.status === 401 &&
      error.config &&
      !error.config.url?.includes("/auth/login")
    ) {
      const { logout } = useAuth.getState()
      logout()
    }
    return Promise.reject(error)
  }
)
