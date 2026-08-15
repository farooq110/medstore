import { useEffect } from "react"
import { useForm, Controller } from "react-hook-form"
import { useCreateItem, useUpdateItem } from "../../hooks/use-items"
import { useCategories } from "../../hooks/use-categories"
import { Modal } from "../ui/modal"
import { Button } from "../ui/button"
import { MultiSelect } from "../ui/multi-select"
import { Item } from "../../types"
import { Loader2, Package, Tag, Boxes, AlertTriangle, Calendar } from "lucide-react"
import { cn } from "../../lib/utils"

export interface ItemFormValues {
  name: string
  category: string
  stockQuantity: number
  lowStockThreshold: number
  sellingPrice: number
  costPrice: number
  expiryDate: string
}

interface ItemModalProps {
  isOpen: boolean
  onClose: () => void
  item: Item | null
}

export function ItemModal({ isOpen, onClose, item }: ItemModalProps) {
  const createItem = useCreateItem()
  const updateItem = useUpdateItem()
  const { data: categoryData } = useCategories({ limit: 100 })
  const categories = categoryData?.data || []

  const { register, handleSubmit, reset, control, formState: { errors } } = useForm<ItemFormValues>()

  useEffect(() => {
    if (item) {
      reset({
        name: item.name,
        category: typeof item.category === "string" ? item.category : item.category._id,
        stockQuantity: item.stockQuantity,
        lowStockThreshold: item.lowStockThreshold,
        sellingPrice: item.sellingPrice,
        costPrice: item.costPrice,
        expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split("T")[0] : "",
      })
    } else {
      reset({
        name: "",
        category: "",
        stockQuantity: 0,
        lowStockThreshold: 10,
        sellingPrice: 0,
        costPrice: 0,
        expiryDate: "",
      })
    }
  }, [item, isOpen, reset])

  const onSubmit = async (data: ItemFormValues) => {
    try {
      if (item) {
        await updateItem.mutateAsync({ id: item._id, data })
      } else {
        await createItem.mutateAsync(data)
      }
      onClose()
    } catch (error) {
      console.error("Failed to save item:", error)
    }
  }

  const categoryOptions = categories.map((cat: any) => ({
    label: cat.name,
    value: cat._id,
  }))

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={item ? "Edit Product Details" : "Add New Product"}
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Package className="h-3.5 w-3.5" /> Product Name
              </label>
              <input
                {...register("name", { required: "Name is required" })}
                placeholder="e.g. Paracetamol 500mg"
                className={cn(
                  "w-full rounded-lg border bg-background px-3 py-2 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary",
                  errors.name ? "border-danger ring-danger/10" : "border-border"
                )}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Tag className="h-3.5 w-3.5" /> Category
              </label>
              <Controller
                name="category"
                control={control}
                rules={{ required: "Category is required" }}
                render={({ field }) => (
                  <MultiSelect
                    options={categoryOptions}
                    value={field.value ? [field.value] : []}
                    onChange={(val) => field.onChange(val[0])}
                    placeholder="Select Category"
                    multiple={false}
                    error={errors.category?.message}
                  />
                )}
              />
            </div>

            <div className="grid gap-2">
              <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                <Calendar className="h-3.5 w-3.5" /> Expiry Date
              </label>
              <input
                type="date"
                {...register("expiryDate", { required: "Expiry date is required" })}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  <Boxes className="h-3.5 w-3.5" /> Stock
                </label>
                <input
                  type="number"
                  {...register("stockQuantity", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-semibold flex items-center gap-2 text-warning">
                  <AlertTriangle className="h-3.5 w-3.5" /> Threshold
                </label>
                <input
                  type="number"
                  {...register("lowStockThreshold", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            <div className="pt-2 border-t border-border mt-2 space-y-4">
              <div className="grid gap-2">
                <label className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
                  Selling Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("sellingPrice", { valueAsNumber: true, required: "Selling price is required" })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid gap-2 text-muted-foreground/80">
                <label className="text-sm font-semibold flex items-center gap-2">
                  Cost Price
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("costPrice", { valueAsNumber: true })}
                  className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <p className="text-[10px] italic">Only visible to owners</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-6 border-t border-border">
          <Button variant="outline" type="button" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" className="flex-1" disabled={createItem.isPending || updateItem.isPending}>
            {createItem.isPending || updateItem.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              item ? "Update Product" : "Add Product"
            )}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
