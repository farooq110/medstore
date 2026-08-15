import { useState } from "react"
import { useAlerts, useMarkAlertSeen } from "../hooks/use-alerts"
import { useAuth } from "../hooks/use-auth"
import { AlertCard } from "../components/ui/alert-card"
import { Button } from "../components/ui/button"
import { Loader2, CheckCheck, Bell } from "lucide-react"
import { USER_ROLES, AlertType } from "../types"
import { Skeleton } from "../components/ui/skeleton"

export function Alerts() {
  const { user } = useAuth()
  const { data: alerts = [], isLoading } = useAlerts()
  const markAsSeen = useMarkAlertSeen()
  const [filter, setFilter] = useState<AlertType | "all">("all")

  const filteredAlerts = alerts.filter(a => filter === "all" || a.type === filter)

  const handleMarkAllAsSeen = async () => {
    const unseen = alerts.filter(a => {
      const isSeen = user?.role === USER_ROLES.OWNER ? a.seenByOwner : a.seenBySalesPerson
      return !isSeen
    })
    
    for (const alert of unseen) {
      markAsSeen.mutate(alert._id)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground dark:text-white">Alerts</h1>
          <p className="text-sm text-muted">Stay on top of critical events.</p>
        </div>
        <Button
          variant="outline"
          onClick={handleMarkAllAsSeen}
          disabled={markAsSeen.isPending || isLoading}
        >
          <CheckCheck className="mr-2 h-4 w-4" /> Mark all as seen
        </Button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {(["all", "low_stock", "order_status", "payment_status"] as const).map((t) => (
          <Button
            key={t}
            variant={filter === t ? "primary" : "outline"}
            size="sm"
            onClick={() => setFilter(t as any)}
            className="capitalize whitespace-nowrap"
            disabled={isLoading}
          >
            {t.replace("_", " ")}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-2 rounded-xl border border-border p-5 bg-surface">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-3 w-3/4" />
              <div className="mt-2">
                <Skeleton className="h-8 w-20 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAlerts.length > 0 ? (
        <div className="space-y-4">
          {filteredAlerts.map((alert) => (
            <AlertCard
              key={alert._id}
              alert={alert}
            />
          ))}
        </div>
      ) : (
        <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background p-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted/10">
            <Bell className="h-6 w-6 text-muted" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-foreground">No alerts</h3>
          <p className="mt-1 text-sm text-muted">You're all caught up!</p>
        </div>
      )}
    </div>
  )
}
