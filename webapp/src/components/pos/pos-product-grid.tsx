import { Search, Check, Plus, ShoppingCart, Loader2 } from "lucide-react"
import { Button } from "../ui/button"
import { cn, formatCurrency } from "../../lib/utils"
import { Item, Category } from "../../types"
import { MultiSelect } from "../ui/multi-select"
import { Skeleton } from "../ui/skeleton"

interface PosProductGridProps {
  items: Item[]
  isLoading: boolean
  searchQuery: string
  setSearchQuery: (query: string) => void
  categories: Category[]
  selectedCategoryIds: string[]
  setSelectedCategoryIds: (ids: string[]) => void
  handleAddItem: (item: Item) => void
  addedItemId: string | null
  activeTab: "products" | "cart"
  totalItems: number
  setActiveTab: (tab: "products" | "cart") => void
}

export function PosProductGrid({
  items,
  isLoading,
  searchQuery,
  setSearchQuery,
  categories,
  selectedCategoryIds,
  setSelectedCategoryIds,
  handleAddItem,
  addedItemId,
  activeTab,
  totalItems,
  setActiveTab
}: PosProductGridProps) {
  const categoryOptions = categories.map(cat => ({
    label: cat.name,
    value: cat._id
  }))
  
  const filteredItems = items

  return (
    <div className={cn(
      "flex flex-1 flex-col rounded-xl border border-border bg-surface lg:h-full min-h-[500px] lg:min-h-0",
      activeTab !== "products" && "hidden lg:flex"
    )}>
      <div className="border-b border-border p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-border bg-background pl-10 pr-4 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {isLoading && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-primary" />}
        </div>
        
        <div className="w-full sm:w-64">
          <MultiSelect
            placeholder="Select Categories..."
            options={categoryOptions}
            value={selectedCategoryIds}
            onChange={setSelectedCategoryIds}
            className="w-full"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {isLoading && items.length === 0 && (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col items-start rounded-xl border border-border bg-background p-4 text-left">
                <div className="flex justify-between w-full mb-3">
                  <Skeleton className="h-3 w-12" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <div className="mt-auto w-full space-y-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </div>
            ))
          )}
          
          {!isLoading && filteredItems.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted text-sm italic font-medium">
              No products found matching your search.
            </div>
          )}

          {filteredItems.map(item => (
            <div
              key={item._id}
              className="flex flex-col items-start rounded-xl border border-border bg-background p-4 text-left transition-all hover:border-primary hover:shadow-sm"
            >
              <div className="flex justify-between w-full">
                {/* <span className="text-[10px] text-muted uppercase tracking-wider">{item.sku}</span> */}
                <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full", item.stockQuantity > 0 ? "bg-success/10 text-success" : "bg-danger/10 text-danger")}>
                  {item.stockQuantity} in stock
                </span>
              </div>
              <span className="mt-1 font-semibold text-foreground line-clamp-2 text-sm h-10">{item.name}</span>
              <div className="mt-auto pt-4 w-full flex flex-col gap-2">
                <span className="text-lg font-bold text-primary">{formatCurrency(item.sellingPrice)}</span>
                <Button
                  variant={addedItemId === item._id ? "secondary" : "outline"}
                  size="sm"
                  className="w-full transition-all duration-300 h-9 px-2"
                  onClick={() => handleAddItem(item)}
                  disabled={item.stockQuantity <= 0}
                >
                  <div className="flex items-center justify-center gap-1">
                    {addedItemId === item._id ? (
                      <>
                        <Check className="h-4 w-4 text-success shrink-0" />
                        <span className="text-[10px] font-bold">Added</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 shrink-0" />
                        <span className="text-[10px] font-bold whitespace-nowrap">Add to Cart</span>
                      </>
                    )}
                  </div>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {activeTab === "products" && totalItems > 0 && (
        <div className="lg:hidden p-4 border-t border-border bg-surface">
          <Button 
            className="w-full h-12 text-base flex justify-between px-6"
            onClick={() => setActiveTab("cart")}
          >
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              <span>{totalItems} items</span>
            </div>
            <span>Review Cart</span>
          </Button>
        </div>
      )}
    </div>
  )
}
