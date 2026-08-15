import React from "react"
import { Info } from "lucide-react"
import { cn } from "../../lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    value: string
    isPositive: boolean
  }
  description?: string
  className?: string
}

export function StatCard({ title, value, icon, trend, description, className }: StatCardProps) {
  return (
    <div className={cn("rounded-xl border border-border bg-background p-6 dark:border-gray-800 dark:bg-gray-900", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium text-muted dark:text-gray-400">{title}</p>
          {description && (
            <div className="group relative flex items-center">
              <Info className="h-4 w-4 cursor-pointer text-muted/60 hover:text-muted transition-colors" />
              <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 w-48 -translate-x-1/2 rounded-lg bg-gray-900/95 px-3 py-2 text-xs font-normal text-white opacity-0 shadow-lg transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100 dark:bg-gray-100 dark:text-gray-900">
                {description}
                <div className="absolute top-full left-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1 bg-gray-900/95 rotate-45 dark:bg-gray-100"></div>
              </div>
            </div>
          )}
        </div>
        {icon && <div className="text-muted dark:text-gray-500">{icon}</div>}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <h3 className="text-2xl font-semibold text-foreground dark:text-white">{value}</h3>
        {trend && (
          <span
            className={cn(
              "text-xs font-medium",
              trend.isPositive ? "text-success" : "text-danger"
            )}
          >
            {trend.isPositive ? "+" : "-"}{trend.value}
          </span>
        )}
      </div>
    </div>
  )
}
