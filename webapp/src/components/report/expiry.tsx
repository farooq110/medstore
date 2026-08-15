import { useExpiryReport } from "@/src/hooks/use-reports"
import { usePagination } from "@/src/hooks/use-pagination"
import { DataTable } from "../ui/data-table"
import { StatCard } from "../ui/stat-card"
import { formatCurrency, formatDate } from "@/src/lib/utils"
import { Pagination } from "../shared/pagination"
import { Button } from "../ui/button"
import { useState } from "react"
import { StatCardSkeleton } from "../ui/stat-card-skeleton"

const Expiry = () => {
    const [expiryStatus, setExpiryStatus] = useState<"all" | "expired" | "expiring_soon">("all")
    const expiryPagination = usePagination({ initialLimit: 10 })

    const { data: expiryData, isLoading: expiryLoading } = useExpiryReport({
        status: expiryStatus,
        page: expiryPagination.page,
        limit: expiryPagination.limit,
    })

    const summary = expiryData?.summary
    const details = expiryData?.details || []
    const pagination = expiryData?.pagination

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
                {expiryLoading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    <>
                        <StatCard title="Expiring within 90 days" value={summary?.expiringSoonCount || 0} />
                        <StatCard title="Expired" value={summary?.expiredCount || 0} />
                    </>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {[
                    { id: "all", label: "All" },
                    { id: "expiring_soon", label: "Expiring soon" },
                    { id: "expired", label: "Expired" },
                ].map((opt) => (
                    <Button
                        key={opt.id}
                        variant={expiryStatus === (opt.id as any) ? "primary" : "outline"}
                        size="sm"
                        onClick={() => {
                            setExpiryStatus(opt.id as any)
                            expiryPagination.setPage(1)
                        }}
                    >
                        {opt.label}
                    </Button>
                ))}
            </div>
            <DataTable
                data={details}
                loading={expiryLoading}
                columns={[
                    { header: "SKU", accessor: "sku" },
                    { header: "Name", accessor: "name" },
                    { header: "Stock", accessor: (row: any) => `${row.stockQuantity}` },
                    { header: "Expiry Date", accessor: (row) => (
                        <span className={`font-medium ${(row as any).isExpired ? "text-red-600" : "text-amber-600"}`}>
                            {formatDate((row as any).expiryDate)}
                        </span>
                    ) },
                ]}
            />
            {pagination && (
                <Pagination
                    pagination={pagination}
                    onPageChange={expiryPagination.setPage}
                    currentCount={details.length}
                />
            )}
        </div>
    )
}

export default Expiry