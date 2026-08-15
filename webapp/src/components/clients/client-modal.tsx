import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { Client, USER_ROLES } from "../../types"
import { useCreateClient, useUpdateClient } from "../../hooks/use-clients"
import { useUsers } from "../../hooks/use-users"
import { successMessage, errorMessage } from "../../lib/notifications"
import { Loader2, X } from "lucide-react"

interface ClientModalProps {
  isOpen: boolean
  onClose: () => void
  client: Client | null
}

interface ClientFormValues {
  name: string
  phone: string
  email: string
  address: string
  shopName: string
  creditLimit: number
  isActive: boolean
  ntn?: string
}

export function ClientModal({ isOpen, onClose, client }: ClientModalProps) {
  const isEditing = !!client
  
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()
  const { data: usersResponse, isLoading: usersLoading } = useUsers({ limit: 1000 })
  const users = usersResponse?.data || []

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>()

  useEffect(() => {
    if (isOpen) {
      if (client) {
        reset({
          name: client.name || "",
          phone: client.phone || "",
          email: client.email || "",
          address: client.address || "",
          shopName: client.shopName || "",
          creditLimit: client.creditLimit,
          isActive: client.isActive ?? true,
          ntn: client.ntn || "",
        })
      } else {
        reset({
          name: "",
          phone: "",
          email: "",
          address: "",
          shopName: "",
          creditLimit: 50000,
          isActive: true,
          ntn: "",
        })
      }
    }
  }, [isOpen, client, reset])

  if (!isOpen) return null

  const onSubmit = async (data: ClientFormValues) => {
    try {
      if (isEditing && client) {
        await updateClient.mutateAsync({ id: client._id, data: data as unknown as Partial<Client> })
        successMessage("Client Updated", `${data.name} has been updated successfully.`)
      } else {
        await createClient.mutateAsync(data as unknown as Partial<Client>)
        successMessage("Client Created", `${data.name} has been added to your clients.`)
      }
      onClose()
    } catch (error: any) {
      errorMessage("Error", error.message || "Failed to save client")
    }
  }

  const isSubmitting = createClient.isPending || updateClient.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl bg-background shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-border p-6 bg-surface">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {isEditing ? "Edit Client" : "Add New Client"}
            </h2>
            <p className="text-sm text-muted mt-1">
              {isEditing ? "Update client details and credit limits." : "Create a new client profile."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted hover:bg-muted/10 hover:text-foreground transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 custom-scrollbar">
          <form id="client-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div className="col-span-2 sm:col-span-1">
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Client Name <span className="text-danger">*</span>
                </label>
                <input
                  {...register("name", { required: "Name is required" })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  placeholder="e.g., John Doe"
                />
                {errors.name && (
                  <p className="mt-1.5 text-xs font-medium text-danger">{errors.name.message}</p>
                )}
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Shop / Business Name <span className="text-danger">*</span>
                </label>
                <input
                  {...register("shopName", { required: "Shop name is required" })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  placeholder="e.g., Doe Pharmacy"
                />
                {errors.shopName && (
                  <p className="mt-1.5 text-xs font-medium text-danger">{errors.shopName.message}</p>
                )}
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Phone Number <span className="text-danger">*</span>
                </label>
                <input
                  {...register("phone", { required: "Phone number is required" })}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  placeholder="+1 234 567 8900"
                />
                {errors.phone && (
                  <p className="mt-1.5 text-xs font-medium text-danger">{errors.phone.message}</p>
                )}
              </div>

              <div className="col-span-2 sm:col-span-1">
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Email <span className="text-muted text-xs font-normal">(Optional)</span>
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  placeholder="john@example.com"
                />
              </div>

              <div className="col-span-2">
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Address <span className="text-danger">*</span>
                </label>
                <textarea
                  {...register("address", { required: "Address is required" })}
                  rows={2}
                  className="w-full rounded-lg border border-border bg-background px-4 py-2.5 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all resize-none"
                  placeholder="Full physical address"
                />
                {errors.address && (
                  <p className="mt-1.5 text-xs font-medium text-danger">{errors.address.message}</p>
                )}
              </div>


              <div className="col-span-2 sm:col-span-1">
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Credit Limit <span className="text-danger">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    {...register("creditLimit", { 
                      required: "Credit limit is required",
                      valueAsNumber: true,
                      min: { value: 0, message: "Must be a positive value" }
                    })}
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-4 pr-4 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                {errors.creditLimit && (
                  <p className="mt-1.5 text-xs font-medium text-danger">{errors.creditLimit.message}</p>
                )}
              </div>
              
              <div className="col-span-2 sm:col-span-1">
                <label className="mb-2 block text-sm font-semibold text-foreground">
                  Ntn
                </label>
                <div className="relative">
                  <input
                    type="text"
                    {...register("ntn")}
                    className="w-full rounded-lg border border-border bg-background py-2.5 pl-4 pr-4 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                  />
                </div>
                {errors.ntn && (
                  <p className="mt-1.5 text-xs font-medium text-danger">{errors.ntn.message}</p>
                )}
              </div>

              <div className="col-span-2 flex items-center pt-2">
                <input
                  type="checkbox"
                  id="isActive"
                  {...register("isActive")}
                  className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <label htmlFor="isActive" className="ml-3 text-sm font-medium text-foreground">
                  Active Client Profile
                </label>
              </div>
            </div>
          </form>
        </div>

        <div className="border-t border-border bg-muted/5 p-6 flex justify-end gap-3 mt-auto">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-border bg-background px-6 py-2.5 text-sm font-semibold text-foreground hover:bg-muted/5 transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="client-form"
            disabled={isSubmitting}
            className="flex items-center justify-center rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-70 min-w-[120px] shadow-sm shadow-primary/20"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              isEditing ? "Save Changes" : "Create Client"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
