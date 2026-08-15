import { useState } from "react"
import { useCategories, useDeleteCategory } from "../hooks/use-categories"
import { useDebounce } from "../hooks/use-debounce"
import { usePagination } from "../hooks/use-pagination"
import { DataTable } from "../components/ui/data-table"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Pagination } from "../components/shared/pagination"
import { formatDate } from "../lib/utils"
import { Category } from "../types"
import { Plus, Loader2, Search, Layers, Trash2 } from "lucide-react"
import { CategoryModal } from "../components/category/category-modal"
import { errorMessage, successMessage } from "../lib/notifications"
import { ConfirmDialog } from "../components/ui/confirm-dialog"
import { useNavigate } from "react-router-dom"

export function Categories() {
  const { page, setPage, limit } = usePagination()
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const navigate = useNavigate()
  
  const { data: response, isLoading } = useCategories({ 
    search: debouncedSearch, 
    status: statusFilter,
    page, 
    limit 
  })
  
  const deleteCategory = useDeleteCategory()
  
  const categories = response?.data || []
  const pagination = response?.pagination

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string, name: string } | null>(null)

  const openModal = (category?: Category) => {
    setEditingCategory(category || null)
    setIsModalOpen(true)
  }

  const handleDelete = (id: string, name: string) => {
    setCategoryToDelete({ id, name })
  }

  const confirmDelete = async () => {
    if (categoryToDelete) {
      try {
        await deleteCategory.mutateAsync(categoryToDelete.id)
        successMessage("Category Deleted", "The category has been removed successfully.")
        setCategoryToDelete(null)
      } catch (error: any) {
        errorMessage("Delete Failed", error.message || "Failed to delete category")
        setCategoryToDelete(null)
      }
    }
  }

  const columns = [
    { 
      header: "Category Name", 
      accessor: (row: Category) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{row.name}</span>
          {row.description && (
            <span className="text-xs text-muted-foreground line-clamp-1">{row.description}</span>
          )}
        </div>
      )
    },
    { 
      header: "Products", 
      accessor: (row: any) => (
        <div className="flex items-center gap-1 cursor-pointer font-semibold text-primary hover:underline hover:text-primary/80 transition-colors" onClick={() => navigate(`/items?categoryId=${row._id}`)}>
          <span>{row.productCount || 0}</span>
          <span className="text-[10px]">Items</span>
        </div>
      )
    },
    { 
      header: "Created At", 
      accessor: (row: Category) => (
        <span className="text-xs text-foreground font-medium">
          {formatDate(row.createdAt)}
        </span>
      )
    },
    { 
      header: "Status", 
      accessor: (row: Category) => (
        row.isActive ? (
          <Badge variant="success">Active</Badge>
        ) : (
          <Badge variant="danger">Inactive</Badge>
        )
      )
    },
    {
      header: "Actions",
      accessor: (row: Category) => (
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => openModal(row)}
            className="h-8 px-2 hover:bg-primary/5 hover:text-primary transition-colors"
          >
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleDelete(row._id, row.name)}
            className="h-8 px-2 hover:bg-danger/5 hover:text-danger transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Categories</h1>
          <p className="text-sm text-muted-foreground">Manage your product categories and organize your inventory.</p>
        </div>
        <Button onClick={() => openModal()} className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Add Category
        </Button>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row bg-surface p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2.5 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
        <div className="w-full sm:w-48">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="all">All Statuses</option>
          </select>
        </div>
      </div>

      <DataTable 
        data={categories} 
        columns={columns} 
        loading={isLoading}
        className={pagination && pagination.pages > 1 ? "max-h-[calc(100vh-333px)]" : "max-h-[calc(100vh-250px)]"} 
      />
      {!isLoading && categories.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-surface text-center px-4">
          <div className="h-16 w-16 bg-muted/10 rounded-full flex items-center justify-center">
            <Layers className="h-8 w-8 text-muted" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">No categories found</h3>
            <p className="text-sm text-muted max-w-xs">We couldn't find any categories matching your search. Try adjusting your query.</p>
          </div>
          <Button variant="outline" onClick={() => { setSearchQuery(""); setStatusFilter("active"); setPage(1); }}>
            Clear all filters
          </Button>
        </div>
      )}
      {!isLoading && categories.length > 0 && pagination && (
        <Pagination 
          pagination={pagination} 
          onPageChange={setPage} 
          currentCount={categories.length}
        />
      )}

      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        category={editingCategory}
      />

      <ConfirmDialog
        isOpen={!!categoryToDelete}
        title="Delete Category"
        description={`Are you sure you want to delete the category "${categoryToDelete?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        onConfirm={confirmDelete}
        onCancel={() => setCategoryToDelete(null)}
        isLoading={deleteCategory.isPending}
      />
    </div>
  )
}
