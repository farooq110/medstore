import { useStockReport } from "@/src/hooks/use-reports"
import { usePagination } from "@/src/hooks/use-pagination"
import { DataTable } from "../ui/data-table"
import { StatCard } from "../ui/stat-card"
import { formatCurrency } from "@/src/lib/utils"
import { Pagination } from "../shared/pagination"
import { Button } from "../ui/button"
import { useState } from "react"
import { StatCardSkeleton } from "../ui/stat-card-skeleton"

const Stock = () => {
    const [stockFilter, setStockFilter] = useState<"all" | "low_stock" | "out_of_stock">("all")
    const stockPagination = usePagination({ initialLimit: 10 })

    const { data: stockData, isLoading: stockLoading } = useStockReport({
        filter: stockFilter,
        page: stockPagination.page,
        limit: stockPagination.limit,
    })

    const summary = stockData?.summary
    const details = stockData?.details || []
    const pagination = stockData?.pagination

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
                {stockLoading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    <>
                        <StatCard title="Total Items" value={summary?.totalItems || 0} />
                        <StatCard title="Low Stock Items" value={summary?.lowStockCount || 0} />
                        <StatCard title="Out of Stock" value={summary?.outOfStockCount || 0} />
                    </>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {[
                    { id: "all", label: "All" },
                    { id: "low_stock", label: "Low stock" },
                    { id: "out_of_stock", label: "Out of stock" },
                ].map((opt) => (
                    <Button
                        key={opt.id}
                        variant={stockFilter === (opt.id as any) ? "primary" : "outline"}
                        size="sm"
                        onClick={() => {
                            setStockFilter(opt.id as any)
                            stockPagination.setPage(1)
                        }}
                    >
                        {opt.label}
                    </Button>
                ))}
            </div>
            <DataTable
                data={details}
                loading={stockLoading}
                columns={[
                    { header: "SKU", accessor: "sku" },
                    { header: "Name", accessor: "name" },
                    { 
                      header: "Category", 
                      accessor: (row: any) => row.category?.name || "N/A"
                    },
                    { header: "Stock", accessor: (row) => (
                      <span className={(row as any).stockQuantity <= (row as any).lowStockThreshold ? "font-medium text-red-600" : ""}>
                        {(row as any).stockQuantity}
                      </span>
                    )},
                    { header: "Value (Cost)", accessor: (row: any) => formatCurrency((row.stockQuantity || 0) * (row.costPrice || 0)) },
                    { header: "Value (Sale)", accessor: (row: any) => formatCurrency((row.stockQuantity || 0) * (row.sellingPrice || 0)) },
                ]}
            />
            {pagination && (
                <Pagination
                    pagination={pagination}
                    onPageChange={stockPagination.setPage}
                    currentCount={details.length}
                />
            )}
        </div>
    )
}

export default Stock