import { cn } from "@/src/lib/utils";
import { Modal } from "../ui/modal";
import { CheckCircle, Truck, Wallet } from "lucide-react";
import { Button } from "../ui/button";
import { useAssignOrder } from "@/src/hooks/use-orders";

interface AssignSalesmanModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: () => void;
    salesPersons: Array<{
        _id: string;
        name: string;
        email: string;
    }>;
    selectedSalesPersonId: string;
    setSelectedSalesPersonId: (id: string) => void;
    assignFor: "delivery" | "payment_collection";
    setAssignFor: (assignFor: "delivery" | "payment_collection") => void;
    assignOrder: ReturnType<typeof useAssignOrder>;
}

const AssignSalesmanModal: React.FC<AssignSalesmanModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    salesPersons,
    selectedSalesPersonId,
    setSelectedSalesPersonId,
    assignFor,
    setAssignFor,
    assignOrder,
}) => {
    return (
        <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Assign Salesperson"
      >
        <div className="space-y-6 pt-2">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Select Salesperson</label>
            <div className="grid gap-2 overflow-y-auto max-h-[300px] px-1 py-1">
              {salesPersons.map((person) => (
                <button
                  key={person._id}
                  onClick={() => setSelectedSalesPersonId(person._id)}
                  className={cn(
                    "flex items-center justify-between rounded-xl border p-4 text-left transition-all",
                    selectedSalesPersonId === person._id
                      ? "border-primary bg-primary/5 ring-1 ring-primary"
                      : "border-border bg-surface hover:border-primary/50"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full font-bold",
                      selectedSalesPersonId === person._id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    )}>
                      {person.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{person.name}</p>
                      <p className="text-xs text-muted-foreground">{person.email}</p>
                    </div>
                  </div>
                  {selectedSalesPersonId === person._id && (
                    <div className="rounded-full bg-primary p-1 text-primary-foreground">
                      <CheckCircle className="h-4 w-4" />
                    </div>
                  )}
                </button>
              ))}
              {salesPersons.length === 0 && (
                <p className="py-4 text-center text-sm text-muted-foreground italic">No active salespersons found.</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Task Type</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setAssignFor("delivery")}
                className={cn(
                  "flex flex-1 flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                  assignFor === "delivery"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border bg-surface hover:border-primary/50"
                )}
              >
                <Truck className={cn("h-6 w-6", assignFor === "delivery" ? "text-primary" : "text-muted-foreground")} />
                <span className="text-sm font-semibold">Delivery</span>
              </button>
              <button
                type="button"
                onClick={() => setAssignFor("payment_collection")}
                className={cn(
                  "flex flex-1 flex-col items-center gap-2 rounded-xl border p-4 transition-all",
                  assignFor === "payment_collection"
                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                    : "border-border bg-surface hover:border-primary/50"
                )}
              >
                <Wallet className={cn("h-6 w-6", assignFor === "payment_collection" ? "text-primary" : "text-muted-foreground")} />
                <span className="text-sm font-semibold text-center leading-tight">Collection Only</span>
              </button>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={onSubmit}
              disabled={!selectedSalesPersonId || assignOrder.isPending}
            >
              {assignOrder.isPending ? "Assigning..." : "Confirm Assignment"}
            </Button>
          </div>
        </div>
      </Modal>
    )
}

export default AssignSalesmanModal