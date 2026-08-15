import { useState, useEffect } from "react"
import { useUser, useClientOptions, useAssignClients, useRemoveClient } from "../../hooks/use-users"
import { Modal } from "../ui/modal"
import { Button } from "../ui/button"
import { MultiSelect, Option } from "../ui/multi-select"
import { User } from "../../types"
import { Loader2, UserPlus, UserMinus, Users, ShoppingBag } from "lucide-react"
import { successMessage, errorMessage } from "../../lib/notifications"

interface AssignClientsModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
}

export function AssignClientsModal({ isOpen, onClose, user }: AssignClientsModalProps) {
  // Only query if the modal is open and we have a user
  const { data: userData, isLoading: userLoading } = useUser(isOpen ? user?._id || "" : "")
  const { data: clientOptions, isLoading: optionsLoading } = useClientOptions(
    isOpen ? { isAssigned: "false", limit: 100 } : undefined
  )
  const assignClients = useAssignClients()
  const removeClient = useRemoveClient()

  const [selectedClients, setSelectedClients] = useState<string[]>([])

  // Reset selection when modal opens or closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedClients([])
    }
  }, [isOpen])

  const handleAssign = async () => {
    if (!user || selectedClients.length === 0) return

    try {
      await assignClients.mutateAsync({
        salesPersonId: user._id,
        clientIds: selectedClients
      })
      successMessage("Success", "Clients assigned successfully")
      setSelectedClients([])
    } catch (error: any) {
      errorMessage("Error", error.message || "Failed to assign clients")
    }
  }

  const handleUnassign = async (clientId: string) => {
    try {
      await removeClient.mutateAsync(clientId)
      successMessage("Success", "Client removed successfully")
    } catch (error: any) {
      errorMessage("Error", error.message || "Failed to remove client")
    }
  }


  const options: Option[] = (clientOptions?.data || []).map((c: any) => ({
    label: c.shop,
    value: c._id || c.id,
    description: `${c.name} • ${c.phone}`
  }))

  const assignedClients = (userData as any)?.assignedClients || []

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Clients: ${user?.name}`}
      className="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Assign Section */}
        <div className="space-y-4 rounded-xl border border-primary/10 bg-primary/5 p-4">
          <div className="flex items-center gap-2 text-primary font-bold">
            <UserPlus className="h-5 w-5" />
            <h3 className="text-sm">Assign New Clients</h3>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <MultiSelect
              options={options}
              value={selectedClients}
              onChange={setSelectedClients}
              placeholder="Search unassigned clients..."
              className="flex-1"
              disabled={optionsLoading}
            />
            <Button
              onClick={handleAssign}
              disabled={selectedClients.length === 0 || assignClients.isPending}
              className="sm:w-32 h-[42px] font-bold"
            >
              {assignClients.isPending ? <Loader2 className="h-4 w-4 animate-spin text-primary-foreground" /> : "Assign Clients"}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground font-medium">Only clients not currently assigned to any salesperson will appear here.</p>
        </div>

        {/* Currently Assigned Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between border-b border-border/50 pb-2">
            <div className="flex items-center gap-2 text-foreground font-bold">
              <Users className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm">Currently Assigned ({assignedClients.length})</h3>
            </div>
          </div>

          <div className="max-h-[350px] overflow-y-auto pr-1 custom-scrollbar">
            {userLoading ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3 text-muted-foreground">
                <Loader2 className="h-10 w-10 animate-spin" />
                <p className="text-sm font-medium animate-pulse">Loading current assignments...</p>
              </div>
            ) : assignedClients.length > 0 ? (
              <div className="grid gap-2 mb-2">
                {assignedClients.map((client: any) => (
                  <div key={client._id} className="flex items-center justify-between rounded-lg border border-border bg-surface p-3 transition-all hover:border-primary/20 hover:shadow-sm">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foreground text-sm">{client.shopName}</span>
                        <span className="text-[10px] font-extrabold uppercase bg-muted/10 text-muted-foreground px-1.5 py-0.5 rounded tracking-tight">#{client.phone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground text-xs font-medium">
                        <ShoppingBag className="h-3.5 w-3.5" />
                        {client.address}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleUnassign(client._id)}
                      className="h-8 w-8 p-0 text-muted hover:bg-danger/5 hover:text-danger rounded-full transition-all"
                      disabled={removeClient.isPending}
                    >
                      {removeClient.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserMinus className="h-4 w-4" />}
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 rounded-xl border-2 border-dashed border-border bg-muted/5 text-muted-foreground gap-3">
                <div className="h-12 w-12 rounded-full bg-muted/10 flex items-center justify-center">
                  <Users className="h-6 w-6 opacity-40" />
                </div>
                <p className="text-sm font-bold opacity-60">No clients assigned yet</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-border">
          <Button variant="outline" onClick={onClose} className="px-10 h-10 font-bold">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  )
}
