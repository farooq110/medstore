import React from "react"
import { cn } from "../../lib/utils"
import { Skeleton } from "./skeleton"

interface Column<T> {
  header: string
  accessor: keyof T | ((row: T) => React.ReactNode)
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onRowClick?: (row: T) => void
  className?: string
  stickyHeader?: boolean
  loading?: boolean
}

export function DataTable<T>({ 
  data, 
  columns, 
  onRowClick, 
  className, 
  stickyHeader = true,
  loading = false
}: DataTableProps<T>) {
  return (
    <div className={cn("overflow-x-auto rounded-xl border border-border bg-surface shadow-sm", className)}>
      <table className="w-full text-left text-sm text-foreground">
        <thead className={cn("bg-muted/5 text-xs uppercase text-muted font-bold tracking-wider", stickyHeader && "sticky top-0 z-10 bg-surface")}>
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={cn("px-6 py-4 font-semibold", col.className)}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={`skeleton-${i}`} className="bg-surface">
                {columns.map((_, j) => (
                  <td key={`skeleton-cell-${j}`} className="px-6 py-4">
                    <Skeleton className="h-5 w-full max-w-[150px]" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-muted italic">
                No data available
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr
                key={i}
                onClick={() => onRowClick?.(row)}
                className={cn(
                  "bg-surface transition-colors",
                  onRowClick && "cursor-pointer hover:bg-muted/5"
                )}
              >
                {columns.map((col, j) => (
                  <td key={j} className={cn("px-6 py-4", col.className)}>
                    {typeof col.accessor === "function"
                      ? col.accessor(row)
                      : (row[col.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
