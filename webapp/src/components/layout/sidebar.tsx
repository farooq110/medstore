import { NavLink } from "react-router-dom"
import { LayoutDashboard, ShoppingCart, Users, Package, Bell, FileText, Settings, LogOut, Truck, Monitor, Sun, Moon, Layers } from "lucide-react"
import { useAuth } from "../../hooks/use-auth"
import { useAlerts, useUnseenAlertsCount } from "../../hooks/use-alerts"
import { useTheme } from "../../hooks/use-theme"
import { cn } from "../../lib/utils"
import { Button } from "../ui/button"
import { USER_ROLES } from "../../constants/roles"

export function Sidebar() {
  const { user, logout } = useAuth()
  const unseenCount = useUnseenAlertsCount()
  const { theme, toggleTheme } = useTheme()

  const navItems = [
    { name: "Dashboard", to: "/dashboard", icon: LayoutDashboard, roles: [USER_ROLES.OWNER, USER_ROLES.SALES_PERSON] },
    { name: "POS", to: "/pos", icon: Monitor, roles: [USER_ROLES.OWNER, USER_ROLES.SALES_PERSON] },
    { name: "Orders", to: "/orders", icon: ShoppingCart, roles: [USER_ROLES.OWNER, USER_ROLES.SALES_PERSON] },
    { name: "Delivery", to: "/delivery", icon: Truck, roles: [USER_ROLES.OWNER, USER_ROLES.SALES_PERSON] },
    { name: "Clients", to: "/clients", icon: Users, roles: [USER_ROLES.OWNER, USER_ROLES.SALES_PERSON] },
    { name: "Inventory", to: "/items", icon: Package, roles: [USER_ROLES.OWNER] },
    { name: "Categories", to: "/categories", icon: Layers, roles: [USER_ROLES.OWNER] },
    { name: "Reports", to: "/reports", icon: FileText, roles: [USER_ROLES.OWNER] },
    { name: "Users", to: "/users", icon: Settings, roles: [USER_ROLES.OWNER] },
    { name: "Alerts", to: "/alerts", icon: Bell, roles: [USER_ROLES.OWNER, USER_ROLES.SALES_PERSON], badge: unseenCount },
  ]

  const filteredItems = navItems.filter((item) => user && item.roles.includes(user.role))

  return (
    <div className="flex h-full w-64 flex-col border-r border-primary/10 bg-primary text-primary-foreground shadow-xl">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-sm">
            <img src="/icon.svg" alt="Invoice Desk" className="h-10 w-10" />
          </div>
          <span className="text-lg font-bold">Invoice Desk</span>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {filteredItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.to}
            className={({ isActive }) =>
              cn(
                "group flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                isActive
                  ? "bg-accent text-accent-foreground shadow-sm"
                  : "text-primary-foreground/70 hover:bg-white/5 hover:text-primary-foreground"
              )
            }
          >
            <div className="flex items-center gap-3">
              <item.icon className={cn("h-5 w-5 shrink-0 transition-transform group-hover:scale-110")} />
              {item.name}
            </div>
            {item.badge ? (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1.5 text-[10px] font-bold text-white shadow-sm">
                {item.badge}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-4 flex items-center gap-3 px-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 ring-1 ring-white/20">
            <span className="text-sm font-medium text-primary-foreground">
              {user?.name.charAt(0)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-primary-foreground">{user?.name}</span>
            <span className="text-xs text-primary-foreground/50 capitalize">{user?.role}</span>
          </div>
        </div>
        <NavLink 
          to="/profile"
          className={({ isActive }) => cn(
            "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium mb-1 transition-all",
            isActive ? "bg-accent text-accent-foreground shadow-sm" : "text-primary-foreground/70 hover:bg-white/5 hover:text-primary-foreground"
          )}
        >
          <Settings className={cn("h-5 w-5 shrink-0 transition-transform group-hover:rotate-45")} />
          Profile Settings
        </NavLink>
        <Button
          onClick={toggleTheme}
          variant="ghost"
          className="w-full justify-start text-primary-foreground/70 hover:bg-white/5 hover:text-primary-foreground px-3 py-2 h-auto"
        >
          {theme === "light" ? <Moon className="h-5 w-5 shrink-0 mr-3" /> : <Sun className="h-5 w-5 shrink-0 mr-3" />}
          Theme
        </Button>
        <Button
          onClick={logout}
          variant="ghost"
          className="w-full justify-start text-primary-foreground/70 hover:bg-white/5 hover:text-primary-foreground px-3 py-2 h-auto"
        >
          <LogOut className="h-5 w-5 shrink-0 mr-3" />
          Sign out
        </Button>
      </div>
    </div>
  )
}
