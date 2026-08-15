import { AlertTriangle, Clock, PackageX, CheckCircle2, AlertCircle } from "lucide-react"
import { Alert } from "../../types"
import { cn, formatDate } from "../../lib/utils"
import { useAuth } from "../../hooks/use-auth"
import { USER_ROLES } from "../../constants/roles"

interface AlertCardProps {
  alert: Alert
  onClick?: () => void
}

export function AlertCard({ alert, onClick }: AlertCardProps) {
  const { user } = useAuth()
  
  const isSeen = user?.role === USER_ROLES.OWNER ? alert.seenByOwner : alert.seenBySalesPerson

  const getIcon = () => {
    switch (alert.type) {
      case "low_stock":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "out_of_stock":
        return <PackageX className="h-5 w-5 text-red-500" />
      case "expiring_soon":
        return <Clock className="h-5 w-5 text-amber-500" />
      case "expired":
        return <Clock className="h-5 w-5 text-red-500" />
      case "backorder_pending":
        return <AlertCircle className="h-5 w-5 text-blue-500" />
      default:
        return <CheckCircle2 className="h-5 w-5 text-gray-500" />
    }
  }

  const getBgColor = () => {
    if (isSeen) return "bg-background dark:bg-gray-900"
    if (alert.severity === "urgent") return "bg-danger/5 dark:bg-danger/10"
    return "bg-warning/5 dark:bg-warning/10"
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "flex cursor-pointer items-start gap-4 rounded-xl border border-border p-4 transition-colors hover:bg-muted/5 dark:border-gray-800 dark:hover:bg-gray-800/50",
        getBgColor()
      )}
    >
      <div className="mt-0.5 shrink-0">{getIcon()}</div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <p className={cn("text-sm font-medium", !isSeen ? "text-foreground dark:text-white" : "text-muted dark:text-gray-300")}>
            {alert.type.split('_').map(w => w.charAt(0) + w.slice(1)).join(' ')}
          </p>
          <span className="text-xs text-gray-500">{formatDate(alert.createdAt)}</span>
        </div>
        <p className="text-sm text-muted dark:text-gray-400">{alert.message}</p>
      </div>
    </div>
  )
}
