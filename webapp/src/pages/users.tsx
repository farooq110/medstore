import { useState } from "react"
import { useUsers, useUpdateUser } from "../hooks/use-users"
import { useDebounce } from "../hooks/use-debounce"
import { usePagination } from "../hooks/use-pagination"
import { DataTable } from "../components/ui/data-table"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Pagination } from "../components/shared/pagination"
import { User } from "../types"
import { Plus, Loader2, Mail, Phone, Shield } from "lucide-react"
import { cn } from "../lib/utils"
import { UserModal } from "../components/users/user-modal"
import { AssignClientsModal } from "../components/users/assign-clients-modal"
import { ConfirmDialog } from "../components/ui/confirm-dialog"
import { errorMessage, successMessage } from "../lib/notifications"

export function Users() {
  const { page, setPage, limit } = usePagination()
  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery)
  const { data: response, isLoading } = useUsers({ search: debouncedSearch, page, limit })
  const users = response?.data || []
  const pagination = response?.pagination
  const updateUser = useUpdateUser()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isClientModalOpen, setIsClientModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [userToToggle, setUserToToggle] = useState<User | null>(null)

  const openModal = (user?: User) => {
    setEditingUser(user || null)
    setIsModalOpen(true)
  }

  const openClientModal = (user: User) => {
    setEditingUser(user)
    setIsClientModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setIsClientModalOpen(false)
    setEditingUser(null)
  }

  const toggleStatus = (user: User) => {
    setUserToToggle(user)
  }

  const confirmToggleStatus = () => {
    if (userToToggle) {
      updateUser.mutate({ 
        id: userToToggle._id, 
        data: { isActive: !userToToggle.isActive } 
      },{
        onSuccess: () => {
          successMessage(`User ${userToToggle?.isActive ? "deactivated" : "activated"} successfully`);
        },
        onError: (error: any) => {
          errorMessage(`Failed to ${userToToggle?.isActive ? "deactivate" : "activate"} user`);
        }
      });
      setUserToToggle(null)
    }
  }

  const columns = [
    { 
      header: "Name", 
      accessor: (row: User) => (
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <span className="font-semibold text-foreground">{row.name}</span>
        </div>
      ) 
    },
    { 
      header: "Contact Info", 
      accessor: (row: User) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Mail className="h-3 w-3" /> {row.email}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Phone className="h-3 w-3" /> {row.phone}
          </div>
        </div>
      )
    },
    { 
      header: "Role", 
      accessor: (row: User) => (
        <Badge variant="info" className="capitalize">
          <Shield className="mr-1 h-3 w-3" />
          {row.role.replace("_", " ")}
        </Badge>
      ) 
    },
    { 
      header: "Status", 
      accessor: (row: User) => (
        <Badge variant={row.isActive ? "success" : "default"} className="capitalize">
          {row.isActive ? "Active" : "Inactive"}
        </Badge>
      )
    },
    {
      header: "Actions",
      accessor: (row: User) => (
        <div className="flex gap-2">
          {row.role === "sales_person" && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => openClientModal(row)}
              disabled={!row.isActive}
              className="h-8 px-2 text-primary hover:bg-primary/5 hover:text-primary font-bold"
            >
              Manage Clients
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={() => openModal(row)} className="h-8 px-2 hover:bg-primary/5 hover:text-primary font-bold">
            Edit
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => toggleStatus(row)}
            disabled={updateUser.isPending}
            className={cn(
              "h-8 px-2 font-bold",
              row.isActive 
                ? "text-danger hover:bg-danger/5 hover:text-danger" 
                : "text-success hover:bg-success/5 hover:text-success"
            )}
          >
            {row.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      )
    }
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">Users Management</h1>
          <p className="text-sm text-muted-foreground">Create and manage your team and their roles.</p>
        </div>
        <Button onClick={() => openModal()} className="shadow-lg shadow-primary/20">
          <Plus className="mr-2 h-4 w-4" /> Add New User
        </Button>
      </div>

      <div className="flex bg-surface p-4 rounded-xl border border-border shadow-sm">
        <div className="relative flex-1 sm:max-w-xs">
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
          />
        </div>
      </div>

      <DataTable 
        data={users} 
        columns={columns} 
        loading={isLoading}
        className="max-h-[calc(100vh-333px)]" 
      />
      {!isLoading && users.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-surface text-center px-4">
          <p className="text-muted italic">No team members found matching your search.</p>
        </div>
      )}
      {!isLoading && users.length > 0 && pagination && (
        <Pagination 
          pagination={pagination} 
          onPageChange={setPage}
          currentCount={users.length}
        />
      )}

      <UserModal
        isOpen={isModalOpen}
        onClose={closeModal}
        user={editingUser}
      />

      <AssignClientsModal
        isOpen={isClientModalOpen}
        onClose={closeModal}
        user={editingUser}
      />

      <ConfirmDialog
        isOpen={!!userToToggle}
        title={userToToggle?.isActive ? "Deactivate User" : "Activate User"}
        description={userToToggle?.isActive 
          ? `Are you sure you want to deactivate "${userToToggle?.name}"? All assigned clients will be automatically unassigned.` 
          : `Are you sure you want to activate "${userToToggle?.name}"?`}
        confirmText={userToToggle?.isActive ? "Deactivate" : "Activate"}
        variant={userToToggle?.isActive ? "outline" : "primary"}
        onConfirm={confirmToggleStatus}
        onCancel={() => setUserToToggle(null)}
        isLoading={updateUser.isPending}
      />
    </div>
  )
}
