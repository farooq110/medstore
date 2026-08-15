import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { useCreateCategory, useUpdateCategory } from "../../hooks/use-categories"
import { Modal } from "../ui/modal"
import { Button } from "../ui/button"
import { Category } from "../../types"
import { Loader2, Tag, FileText, CheckCircle2, XCircle } from "lucide-react"
import { cn } from "../../lib/utils"

interface CategoryFormValues {
  name: string
  description: string
  isActive: boolean
}

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category: Category | null
}

export function CategoryModal({ isOpen, onClose, category }: CategoryModalProps) {
  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CategoryFormValues>()

  useEffect(() => {
    if (category) {
      reset({
        name: category.name,
        description: category.description || "",
        isActive: category.isActive ?? true,
      })
    } else {
      reset({
        name: "",
        description: "",
        isActive: true,
      })
    }
  }, [category, isOpen, reset])

  const onSubmit = async (data: CategoryFormValues) => {
    try {
      if (category) {
        await updateCategory.mutateAsync({ id: category._id, data })
      } else {
        await createCategory.mutateAsync(data)
      }
      onClose()
    } catch (error) {
      console.error("Failed to save category:", error)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={category ? "Edit Category" : "Add New Category"}
      className="max-w-md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div className="grid gap-2">
            <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <Tag className="h-3.5 w-3.5" /> Category Name
            </label>
            <input
              {...register("name", { required: "Name is required" })}
              placeholder="e.g. Antibiotics"
              className={cn(
                "w-full rounded-lg border bg-background px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary",
                errors.name ? "border-danger ring-danger/10" : "border-border"
              )}
            />
            {errors.name && <p className="text-xs text-danger font-medium">{errors.name.message}</p>}
          </div>

          <div className="grid gap-2">
            <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
              <FileText className="h-3.5 w-3.5" /> Description (Optional)
            </label>
            <textarea
              {...register("description")}
              placeholder="Brief description of this category..."
              rows={3}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          {category && (
            <div className="pt-2">
              <label className="text-sm font-semibold text-muted-foreground mb-3 block">Status</label>
              <div className="flex gap-4">
                <label className={cn(
                  "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all",
                  "hover:border-primary/50",
                  "has-[:checked]:border-primary has-[:checked]:bg-primary/5 has-[:checked]:ring-1 has-[:checked]:ring-primary"
                )}>
                  <input type="radio" {...register("isActive")} value="true" className="hidden" defaultChecked={category.isActive} />
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="text-sm font-medium">Active</span>
                </label>
                <label className={cn(
                  "flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all",
                  "hover:border-danger/50",
                  "has-[:checked]:border-danger has-[:checked]:bg-danger/5 has-[:checked]:ring-1 has-[:checked]:ring-danger"
                )}>
                  <input type="radio" {...register("isActive")} value="false" className="hidden" defaultChecked={!category.isActive} />
                  <XCircle className="h-4 w-4 text-danger" />
                  <span className="text-sm font-medium">Inactive</span>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 pt-6 border-t border-border">
          <Button variant="outline" type="button" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={createCategory.isPending || updateCategory.isPending}>
            {createCategory.isPending || updateCategory.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
            ) : (
              category ? "Update Category" : "Add Category"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
