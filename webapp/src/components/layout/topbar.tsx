import { Menu, Bell, Sun, Moon } from "lucide-react"
import { useAlerts, useUnseenAlertsCount } from "../../hooks/use-alerts"
import { useTheme } from "../../hooks/use-theme"
import { Link } from "react-router-dom"
import { Button } from "../ui/button"

interface TopbarProps {
  onMenuClick: () => void
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const unseenCount = useUnseenAlertsCount()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background px-4 sm:px-6 lg:hidden dark:border-gray-800 dark:bg-gray-900">
      <div className="flex items-center gap-4">
        <Button
          onClick={onMenuClick}
          variant="ghost"
          size="icon"
          className="text-muted hover:bg-muted/5 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <span className="text-lg font-bold text-foreground dark:text-white">Invoice Desk</span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          onClick={toggleTheme}
          variant="ghost"
          size="icon"
          className="text-muted hover:bg-muted/5 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          {theme === "light" ? <Moon className="h-6 w-6" /> : <Sun className="h-6 w-6" />}
        </Button>
        <Link to="/alerts">
          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted hover:bg-muted/5 dark:text-gray-400 dark:hover:bg-gray-800"
          >
            <Bell className="h-6 w-6" />
            {unseenCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] font-medium text-white ring-2 ring-background">
                {unseenCount}
              </span>
            )}
          </Button>
        </Link>
      </div>
    </header>
  )
}
