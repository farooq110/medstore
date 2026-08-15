import { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useOrders } from "../hooks/use-orders"
import { useClients } from "../hooks/use-clients"
import { useDebounce } from "../hooks/use-debounce"
import { usePagination } from "../hooks/use-pagination"
import { DataTable } from "../components/ui/data-table"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { MultiSelect } from "../components/ui/multi-select"
import { Pagination } from "../components/shared/pagination"
import { formatCurrency, formatDate } from "../lib/utils"
import { Client, Order, OrderStatus } from "../types"
import { Plus, Loader2 } from "lucide-react"

interface StatusFilterProps {
  statusFilter: string
  setStatusFilter: (status: string) => void
  setPage: (page: number) => void
}

function StatusFilter({ statusFilter, setStatusFilter, setPage }: StatusFilterProps) {
  return (
    <>
      <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Filter by Status</label>
      <select
        value={statusFilter}
        onChange={(e) => {
          setStatusFilter(e.target.value)
          setPage(1)
        }}
        className="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
      >
        <option value="all">All Statuses</option>
        <option value="created">Created</option>
        <option value="assigned">Assigned</option>
        <option value="items_provided">Items Provided</option>
        <option value="completed">Completed</option>
      </select>
    </>
  )
}

export function OrderList() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { page, setPage, limit } = usePagination()
  const [statusFilter, setStatusFilter] = useState<string>(() => searchParams.get("status") || "all")
  const [selectedClientIds, setSelectedClientIds] = useState<string[]>(() => {
    const clientsParam = searchParams.get("clients")
    return clientsParam ? clientsParam.split(",").filter(Boolean) : []
  })
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery)

  const { data: clientsResponse } = useClients({ limit: 1000 })
  const clientOptions = clientsResponse?.data.map(c => ({
    label: c.shopName,
    value: c._id,
    description: c.name
  })) || []

  const { data: response, isLoading } = useOrders({
    status: statusFilter === "all" ? undefined : statusFilter as OrderStatus,
    clientIds: selectedClientIds.length > 0 ? selectedClientIds : undefined,
    search: debouncedSearch,
    page,
    limit
  })

  const orders = response?.data || []
  const pagination = response?.pagination

  const columns = [
    { header: "Order #", accessor: "orderNumber" as keyof Order },
    {
      header: "Client",
      accessor: (row: Order) => row.client ? (row.client as Client).name : "Deactivated Client"
    },
    {
      header: "Date",
      accessor: (row: Order) => formatDate(row.createdAt)
    },
    {
      header: "Total",
      accessor: (row: Order) => <span className="font-medium">{formatCurrency(row.totalAmount)}</span>
    },
    {
      header: "Due",
      accessor: (row: Order) => (
        <span className={row.dueAmount > 0 ? "text-red-600 font-medium" : "text-gray-500"}>
          {formatCurrency(row.dueAmount)}
        </span>
      )
    },
    {
      header: "Status",
      accessor: (row: Order) => {
        const statusVariants: Record<OrderStatus, any> = {
          created: "warning",
          assigned: "info",
          items_provided: "success",
          completed: "success",
          backorder: "danger"
        }
        return <Badge variant={statusVariants[row.orderStatus]} className="capitalize">{row.orderStatus.replace('_', ' ')}</Badge>
      }
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
        <Button
          onClick={() => navigate("/pos")}
        >
          <Plus className="h-4 w-4 mr-2" /> New Order
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1 sm:max-w-xs">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Search Orders</label>
          <input
            type="text"
            placeholder="Search by Order #..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>
        <div className="flex-1 sm:max-w-xs">
          <StatusFilter statusFilter={statusFilter} setStatusFilter={setStatusFilter} setPage={setPage} />
        </div>
        <div className="flex-1 sm:max-w-sm">
          <MultiSelect
            label="Filter by Clients"
            options={clientOptions}
            value={selectedClientIds}
            onChange={(values) => {
              setSelectedClientIds(values)
              setPage(1)
            }}
            placeholder="Search and select clients..."
          />
        </div>
      </div>

      <DataTable
        data={orders}
        columns={columns}
        loading={isLoading}
        onRowClick={(row) => navigate(`/orders/${row._id}`)}
        className="max-h-[calc(100vh-310px)]"
      />
      {!isLoading && orders.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-surface text-center px-4">
          <p className="text-muted italic">No orders found matching your search or filters.</p>
        </div>
      )}
      {!isLoading && orders.length > 0 && pagination && (
        <Pagination
          pagination={pagination}
          onPageChange={setPage}
          currentCount={orders.length}
        />
      )}
    </div>
  )
}
