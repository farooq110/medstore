import { Loader2, DollarSign, ShoppingBag, Truck, AlertTriangle } from "lucide-react"
import { Link } from "react-router-dom"
import { useAuth } from "../hooks/use-auth"
import { useOrders } from "../hooks/use-orders"
import { useAlerts } from "../hooks/use-alerts"
import { useLowStockItems, useExpiringSoonItems } from "../hooks/use-items"
import { StatCard } from "../components/ui/stat-card"
import { AlertCard } from "../components/ui/alert-card"
import { Button } from "../components/ui/button"
import { formatCurrency } from "../lib/utils"
import { USER_ROLES } from "../constants/roles"
import { StatCardSkeleton } from "../components/ui/stat-card-skeleton"
import { Skeleton } from "../components/ui/skeleton"
import { Client } from "../types"

export function Dashboard() {
  const { user } = useAuth()
  const { data: response, isLoading: isLoadingOrders } = useOrders({ limit: 50 })
  const orders = response?.data || []
  const { data: alerts = [], isLoading: isLoadingAlerts } = useAlerts(false)
  const { data: lowStockItems = [], isLoading: isLoadingLowStock } = useLowStockItems()
  const { data: expiringItems = [], isLoading: isLoadingExpiring } = useExpiringSoonItems()

  const isOwner = user?.role === USER_ROLES.OWNER
  const today = new Date().toISOString().split('T')[0]

  const isLoadingData = isLoadingOrders || isLoadingAlerts || isLoadingLowStock || isLoadingExpiring

  // Calculate metrics
  const totalDues = orders.reduce((sum, o) => sum + o.dueAmount, 0)
  
  const todayCollections = orders.reduce((sum, o) => {
    const todayPayments = o.payments?.filter(p => p.recordedAt.startsWith(today)) || []
    return sum + todayPayments.reduce((pSum, p) => pSum + p.amount, 0)
  }, 0)
  
  const myOrdersToday = orders.filter(o => 
    (typeof o.createdBy === 'string' ? o.createdBy === user?._id : o.createdBy?._id === user?._id) && 
    o.createdAt.startsWith(today)
  ).length

  const pendingDeliveries = orders.filter(o => 
    o.orderStatus !== "completed" && 
    o.orderType === "delivery"
  ).length

  const criticalAlerts = alerts
    .filter(a => a.severity === "urgent")
    .slice(0, 3)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted">Welcome back, {user?.name}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoadingData ? (
          Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
        ) : isOwner ? (
          <>
            <StatCard
              title="Total Outstanding Dues"
              value={formatCurrency(totalDues)}
              icon={<DollarSign className="h-5 w-5" />}
            />
            <StatCard
              title="Today's Collections"
              value={formatCurrency(todayCollections)}
              icon={<DollarSign className="h-5 w-5" />}
            />
            <StatCard
              title="Expiring Items"
              value={expiringItems.length}
              icon={<AlertTriangle className="h-5 w-5" />}
            />
            <StatCard
              title="Low Stock Items"
              value={lowStockItems.length}
              icon={<AlertTriangle className="h-5 w-5" />}
            />
          </>
        ) : (
          <>
            <StatCard
              title="My Orders Today"
              value={myOrdersToday}
              icon={<ShoppingBag className="h-5 w-5" />}
            />
            <StatCard
              title="Pending Deliveries"
              value={pendingDeliveries}
              icon={<Truck className="h-5 w-5" />}
            />
            <StatCard
              title="My Clients' Dues"
              value={formatCurrency(totalDues)}
              icon={<DollarSign className="h-5 w-5" />}
            />
            {/* <StatCardSkeleton /> */}
          </>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Critical Alerts</h2>
            <Link to="/alerts">
              <Button variant="link" size="sm" className="text-foreground">View all</Button>
            </Link>
          </div>
          <div className="space-y-3">
            {isLoadingData ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-2 rounded-lg border border-border p-4">
                  <Skeleton className="h-4 w-1/3" />
                  <Skeleton className="h-3 w-full" />
                </div>
              ))
            ) : criticalAlerts.length > 0 ? (
              criticalAlerts.map(alert => (
                <AlertCard key={alert._id} alert={alert} />
              ))
            ) : (
              <p className="text-sm text-gray-500">No critical alerts.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
            <Link to="/orders">
              <Button variant="link" size="sm" className="text-foreground">View all</Button>
            </Link>
          </div>
          <div className="space-y-4">
            {isLoadingData ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <div className="space-y-2 text-right">
                    <Skeleton className="h-4 w-16 ml-auto" />
                    <Skeleton className="h-3 w-12 ml-auto" />
                  </div>
                </div>
              ))
            ) : orders.slice(0, 4).map(order => (
              <div key={order._id} className="flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0">
                <div>
                  <p className="font-medium text-foreground">
                    {order.client ? (order.client as Client).name : "Deactivated Client"}
                  </p>
                  <p className="text-sm text-muted">{order.orderNumber} • {order.items.length} items</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-foreground">{formatCurrency(order.totalAmount)}</p>
                  <p className="text-sm text-muted capitalize">{order.orderStatus.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
