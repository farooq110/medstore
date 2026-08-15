import { useCollectionsReport } from "@/src/hooks/use-reports"
import { usePagination } from "@/src/hooks/use-pagination"
import { DataTable } from "../ui/data-table"
import { StatCard } from "../ui/stat-card"
import { formatCurrency } from "@/src/lib/utils"
import { Pagination } from "../shared/pagination"
import { useState } from "react"
import { StatCardSkeleton } from "../ui/stat-card-skeleton"

const Collections = () => {
    const today = new Date().toISOString().split("T")[0]
    const [collectionsStartDate, setCollectionsStartDate] = useState(today)
    const [collectionsEndDate, setCollectionsEndDate] = useState(today)

    const collectionsPagination = usePagination({ initialLimit: 10 })
    
    const { data: collectionsData, isLoading: collectionsLoading } = useCollectionsReport({
        startDate: collectionsStartDate,
        endDate: collectionsEndDate,
        page: collectionsPagination.page,
        limit: collectionsPagination.limit,
    })

    const summary = collectionsData?.summary
    const details = collectionsData?.details || []
    const pagination = collectionsData?.pagination

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
                {collectionsLoading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    <>
                        <StatCard title="Total Collected" value={formatCurrency(summary?.totalCollected || 0)} />
                        <StatCard title="Transactions" value={summary?.transactions || 0} />
                    </>
                )}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-muted">Start date</span>
                    <input
                        type="date"
                        value={collectionsStartDate}
                        onChange={(e) => {
                            setCollectionsStartDate(e.target.value)
                            collectionsPagination.setPage(1)
                        }}
                        className="w-full sm:w-44 rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                </div>
                <div className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-muted">End date</span>
                    <input
                        type="date"
                        value={collectionsEndDate}
                        onChange={(e) => {
                            setCollectionsEndDate(e.target.value)
                            collectionsPagination.setPage(1)
                        }}
                        className="w-full sm:w-44 rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                    />
                </div>
            </div>
            <DataTable
                data={details}
                loading={collectionsLoading}
                columns={[
                    { header: "Time", accessor: (row: any) => new Date(row.recordedAt).toLocaleString() },
                    { header: "Method", accessor: (row: any) => <span className="capitalize">{String(row.method || "").replace("_", " ")}</span> },
                    { header: "Amount", accessor: (row: any) => <span className="font-medium text-green-600">{formatCurrency(row.amount)}</span> },
                    { header: "Notes", accessor: "notes" },
                ]}
            />
            {pagination && (
                <Pagination
                    pagination={pagination}
                    onPageChange={collectionsPagination.setPage}
                    currentCount={details.length}
                />
            )}
        </div>
    )
}

export default Collections