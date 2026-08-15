import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useClients } from "../hooks/use-clients"
import { useDebounce } from "../hooks/use-debounce"
import { usePagination } from "../hooks/use-pagination"
import { DataTable } from "../components/ui/data-table"
import { Button } from "../components/ui/button"
import { Pagination } from "../components/shared/pagination"
import { formatCurrency } from "../lib/utils"
import { Client } from "../types"
import { Plus, Loader2, Edit2 } from "lucide-react"
import { useAuth } from "../hooks/use-auth"
import { USER_ROLES } from "../constants/roles"
import { ClientModal } from "../components/clients/client-modal"

export function Clients() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { page, setPage, limit } = usePagination()
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery)
  const { data: response, isLoading } = useClients({ search: debouncedSearch, page, limit })
  
  const clients = response?.data || []
  const pagination = response?.pagination

  const isOwner = user?.role === USER_ROLES.OWNER
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const openModal = (client?: Client) => {
    setEditingClient(client || null)
    setIsModalOpen(true)
  }

  const columns = [
    { header: "Shop Name", accessor: "shopName" as keyof Client, className: "font-medium text-gray-900 dark:text-white" },
    { header: "Client Name", accessor: "name" as keyof Client },
    { header: "Phone", accessor: "phone" as keyof Client },
    { header: "Address", accessor: "address" as keyof Client },
    { 
      header: "Credit Limit", 
      accessor: (row: Client) => formatCurrency(row.creditLimit)
    },
    { 
      header: "Total Due", 
      accessor: (row: Client) => (
        <span className={row.totalDue > 0 ? "text-red-600 font-medium" : "text-gray-500"}>
          {formatCurrency(row.totalDue)}
        </span>
      )
    }
  ]

  if (isOwner) {
    columns.splice(4, 0, {
      header: "Assigned To",
      accessor: (row: Client) => (row as any).salesPerson?.name || "Unassigned"
    })
    
    columns.push({
      header: "Actions",
      accessor: (row: Client) => (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            openModal(row)
          }}
          className="text-primary hover:bg-primary/10 transition-colors"
        >
          <Edit2 className="h-4 w-4 mr-1.5" /> Edit
        </Button>
      )
    })
  } else {
    columns.push({
      header: "Actions",
      accessor: (row: Client) => (
        <Button 
          variant="link" 
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/clients/${row._id}`)
          }}
        >
          View Details
        </Button>
      )
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Clients</h1>
        {isOwner && (
        <Button onClick={() => openModal()}>
          <Plus className="mr-2 h-4 w-4" /> Add Client
        </Button>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <input
          type="text"
          placeholder="Search by name, shop, or phone..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setPage(1)
          }}
          className="w-full sm:max-w-xs rounded-lg border border-gray-300 px-4 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
        />
      </div>

      <DataTable 
        data={clients} 
        columns={columns} 
        loading={isLoading}
        onRowClick={(row) => navigate(`/clients/${row._id}`)}
        className={pagination && pagination.pages > 1 ? "max-h-[calc(100vh-283px)]" : "max-h-[calc(100vh-200px)]"} 
      />
      {!isLoading && clients.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-surface text-center">
          <p className="text-muted italic">No clients found matching your search.</p>
        </div>
      )}
      {!isLoading && clients.length > 0 && pagination && (
        <Pagination 
          pagination={pagination} 
          onPageChange={setPage}
          currentCount={clients.length}
        />
      )}

      <ClientModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        client={editingClient}
      />
    </div>
  )
}

