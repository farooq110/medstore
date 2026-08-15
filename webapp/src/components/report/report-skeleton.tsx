import { StatCardSkeleton } from "../ui/stat-card-skeleton"
import { DataTable } from "../ui/data-table"

export function ReportSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>
      
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="h-14 w-44 rounded-lg bg-muted/20 animate-pulse" />
        <div className="h-14 w-44 rounded-lg bg-muted/20 animate-pulse" />
      </div>

      <DataTable
        data={[]}
        loading={true}
        columns={[
          { header: "Loading...", accessor: "" as any },
          { header: "Loading...", accessor: "" as any },
          { header: "Loading...", accessor: "" as any },
          { header: "Loading...", accessor: "" as any },
        ]}
      />
    </div>
  )
}
