import { Modal } from "./modal"
import { Button } from "./button"
import { AlertTriangle, Trash2 } from "lucide-react"

interface ConfirmDialogProps {
  isOpen: boolean
  title?: string
  description?: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "link"
}

export function ConfirmDialog({
  isOpen,
  title = "Are you sure?",
  description = "This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  onConfirm,
  onCancel,
  isLoading,
  variant = "danger"
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} className="max-w-sm">
      <div className="flex flex-col items-center justify-center text-center space-y-4 pb-2">
        <div className={`h-12 w-12 rounded-full ${variant === 'danger' ? 'bg-danger/10' : 'bg-warning/10'} flex items-center justify-center`}>
          {variant === 'danger' ? (
            <Trash2 className="h-6 w-6 text-danger" />
          ) : (
            <AlertTriangle className={`h-6 w-6 text-${variant}`} />
          )}
        </div>
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="flex gap-3 justify-end mt-6">
        <Button variant="outline" onClick={onCancel} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant={variant} onClick={onConfirm} disabled={isLoading}>
          {isLoading ? "Processing..." : confirmText}
        </Button>
      </div>
    </Modal>
  )
}
