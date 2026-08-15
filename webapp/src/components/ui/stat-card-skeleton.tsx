import { Skeleton } from "./skeleton"

export function StatCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
      <div className="mt-2">
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  )
}
