import { useOutstandingDues } from '@/src/hooks/use-reports'
import { usePagination } from '@/src/hooks/use-pagination'
import { StatCard } from '../ui/stat-card'
import { formatCurrency } from '@/src/lib/utils'
import { DataTable } from '../ui/data-table'
import { Pagination } from '../shared/pagination'
import { StatCardSkeleton } from '../ui/stat-card-skeleton'

const OutstandingDues = () => {
    const duesPagination = usePagination({ initialLimit: 10 })
    const { data: duesData, isLoading: duesLoading } = useOutstandingDues({
        page: duesPagination.page,
        limit: duesPagination.limit,
    })

    const summary = duesData?.summary
    const details = duesData?.details || []
    const pagination = duesData?.pagination

    return (
        <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
                {duesLoading ? (
                    <>
                        <StatCardSkeleton />
                        <StatCardSkeleton />
                    </>
                ) : (
                    <>
                        <StatCard title="Total Outstanding" value={formatCurrency(summary?.totalOutstanding || 0)} />
                        <StatCard title="Clients with Dues" value={summary?.clientsWithDue || 0} />
                    </>
                )}
            </div>
            <DataTable
                data={details}
                loading={duesLoading}
                columns={[
                    { header: "Client", accessor: "clientName" },
                    { header: "Shop Name", accessor: "shopName" },
                    { header: "Total Due", accessor: (row: any) => <span className="font-medium text-red-600">{formatCurrency(row.totalDue)}</span> },
                    { header: "Phone", accessor: "phone" }
                ]}
            />
            {pagination && (
                <Pagination
                    pagination={pagination}
                    onPageChange={duesPagination.setPage}
                    currentCount={details.length}
                />
            )}
        </div>
    )
}

export default OutstandingDues