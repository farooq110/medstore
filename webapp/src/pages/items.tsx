import { useEffect, useState } from "react"
import { useDeleteItem, useItems } from "../hooks/use-items"
import { useDebounce } from "../hooks/use-debounce"
import { usePagination } from "../hooks/use-pagination"
import { DataTable } from "../components/ui/data-table"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Pagination } from "../components/shared/pagination"
import { formatCurrency, formatDate } from "../lib/utils"
import { Item } from "../types"
import { Plus, Loader2, Download, Search, Filter, Box } from "lucide-react"
import { useAuth } from "../hooks/use-auth"
import { USER_ROLES } from "../constants/roles"
import { ItemModal } from "../components/inventory/item-modal"
import { cn } from "../lib/utils"
import { useCategories } from "../hooks/use-categories"
import { ConfirmDialog } from "../components/ui/confirm-dialog"
import { useSearchParams } from "react-router-dom"
export function Items() {
  const { user } = useAuth()
  const [queryParams] = useSearchParams()
  const { page, setPage, limit } = usePagination()
  const deleteItem = useDeleteItem()
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery)
  const [categoryFilter, setCategoryFilter] = useState<string>(queryParams.get("categoryId") || "all")
  const { data: response, isLoading } = useItems({
    search: debouncedSearch,
    category: categoryFilter,
    page,
    limit
  })

  const items = response?.data || []
  const pagination = response?.pagination
  const { data: categoryData } = useCategories({ limit: 100 })
  const categories = categoryData?.data || []

  const isOwner = user?.role === USER_ROLES.OWNER

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (queryParams.get("categoryId")) {
      setCategoryFilter(queryParams.get("categoryId")!)
    }
  }, [])

  const openModal = (item?: Item) => {
    setEditingItem(item || null)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setItemToDelete(id)
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      deleteItem.mutate(itemToDelete)
      setItemToDelete(null)
    }
  }

  const columns = [
    {
      header: "Product / SKU",
      accessor: (row: Item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.name}</span>
          <span className="text-[10px] font-mono text-muted-foreground uppercase">{row.sku || "NO-SKU"}</span>
        </div>
      )
    },
    {
      header: "Category",
      accessor: (row: Item) => (
        <Badge variant="info" className="bg-primary/5 text-foreground border-primary/10">
          {typeof row.category === 'string' ? row.category : row.category.name}
        </Badge>
      )
    },
    {
      header: "Stock Level",
      accessor: (row: Item) => (
        <div className="flex items-center gap-2">
          <span className={cn(
            "font-bold",
            row.stockQuantity === 0 ? "text-danger" :
              row.stockQuantity <= row.lowStockThreshold ? "text-warning" : "text-foreground"
          )}>
            {row.stockQuantity}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-tight">Units</span>
        </div>
      )
    },
    {
      header: "Selling Price",
      accessor: (row: Item) => (
        <span className="font-bold text-foreground">{formatCurrency(row.sellingPrice)}</span>
      )
    },
    {
      header: "Expiry",
      accessor: (row: Item) => (
        <div className="flex flex-col">
          <span className="text-xs text-foreground font-medium">
            {row.expiryDate ? formatDate(row.expiryDate) : "N/A"}
          </span>
          {row.isExpired && (
            <span className="text-[9px] font-bold text-danger uppercase tracking-tighter">Expired</span>
          )}
        </div>
      )
    },
    {
      header: "Status",
      accessor: (row: Item) => {
        if (row.stockQuantity === 0) return <Badge variant="danger">Out of Stock</Badge>
        if (row.stockQuantity <= row.lowStockThreshold) return <Badge variant="warning">Low Stock</Badge>
        return <Badge variant="success">In Stock</Badge>
      }
    }
  ]

  if (isOwner) {
    columns.push({
      header: "Actions",
      accessor: (row: Item) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => openModal(row)}
            className="h-8 px-2 hover:bg-primary/5 hover:text-primary transition-colors"
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDelete(row._id)}
            className="h-8 px-2 transition-colors"
          >
            Delete
          </Button>
        </div>
      )
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-sm text-muted-foreground">Manage your product stock, pricing and expiry status.</p>
        </div>
        {isOwner && (
          <div className="flex gap-2">
            {/* <Button variant="outline" className="border-border hover:bg-muted/5">
              <Download className="mr-2 h-4 w-4" /> Export
            </Button> */}
            <Button onClick={() => openModal()} className="shadow-lg shadow-primary/20">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4 sm:flex-row bg-surface p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or SKU..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="relative w-full sm:max-w-xs">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none capitalize cursor-pointer font-medium"
          >
            <option value="all">All Categories</option>
            {categories.filter((cat) => cat.isActive).map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable 
        data={items} 
        columns={columns} 
        loading={isLoading}
        className={pagination && pagination.pages > 1 ? "max-h-[calc(100vh-333px)]" : "max-h-[calc(100vh-250px)]"} 
      />
      {!isLoading && items.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-surface text-center px-4">
          <div className="h-16 w-16 bg-muted/10 rounded-full flex items-center justify-center">
            <Box className="h-8 w-8 text-muted" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">No products found</h3>
            <p className="text-sm text-muted max-w-xs">We couldn't find any products matching your search or filters. Try adjusting your query.</p>
          </div>
          <Button variant="outline" onClick={() => { setSearchQuery(""); setCategoryFilter("all"); setPage(1); }}>
            Clear all filters
          </Button>
        </div>
      )}
      {!isLoading && items.length > 0 && pagination && (
        <Pagination
          pagination={pagination}
          onPageChange={setPage}
          currentCount={items.length}
        />
      )}

      <ItemModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        item={editingItem}
      />

      <ConfirmDialog
        isOpen={!!itemToDelete}
        title="Delete Item"
        description="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setItemToDelete(null)}
        isLoading={deleteItem.isPending}
      />
    </div>
  )
}
