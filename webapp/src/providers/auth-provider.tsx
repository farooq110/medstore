import { useEffect } from "react"
import { useAuth } from "../hooks/use-auth"
import { authService } from "../services/auth.service"
import { Loader2 } from "lucide-react"

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const { token, setUser, logout, setIsInitializing, isInitializing } = useAuth()

  useEffect(() => {
    const initializeAuth = async () => {
      if (!token) {
        setIsInitializing(false)
        return
      }

      try {
        const response = await authService.getMe()
        if (response && response.data) {
          const userData = response.data
          setUser(userData)
        } else {
          logout()
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error)
        logout()
      } finally {
        setIsInitializing(false)
      }
    }

    initializeAuth()
  }, [token, setUser, logout, setIsInitializing])

  if (isInitializing) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">Authenticating...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
