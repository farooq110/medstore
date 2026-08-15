import { create } from "zustand"
import { persist } from "zustand/middleware"

type Theme = "dark" | "light"

interface ThemeState {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const useTheme = create<ThemeState>()(
  persist(
    (set) => ({
      theme: "light",
      toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: "theme-storage",
    }
  )
)
