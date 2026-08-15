import { ShoppingCart, Truck, Trash2, Minus, Plus, Loader2, Printer, UserCheck } from "lucide-react"
import { Button } from "../ui/button"
import { cn, formatCurrency } from "../../lib/utils"
import { OrderItem, Client, User, OrderType, USER_ROLES } from "../../types"
import { UseFormRegister, FieldErrors, UseFormSetValue } from "react-hook-form"
import { useAuth } from "@/src/hooks/use-auth"

interface POSForm {
  clientId: string
  orderType: OrderType
  assignedTo: string
  discount: number
}

interface PosCartProps {
  items: OrderItem[]
  activeTab: "products" | "cart"
  clients: Client[]
  salesmen: User[]
  isAdmin: boolean
  orderType: string
  subtotal: number
  totalItems: number
  createOrderIsPending: boolean
  register: UseFormRegister<POSForm>
  errors: FieldErrors<POSForm>
  setValue: UseFormSetValue<POSForm>
  handleSubmit: any
  onCheckout: (data: POSForm, shouldPrint: boolean) => void
  removeItem: (id: string) => void
  updateQty: (id: string, delta: number) => void
  setQty: (id: string, value: number) => void
  clientId: string
  assignedTo: string
}

export function PosCart({
  items,
  activeTab,
  clients,
  salesmen,
  isAdmin,
  orderType,
  subtotal,
  totalItems,
  createOrderIsPending,
  register,
  errors,
  setValue,
  handleSubmit,
  onCheckout,
  removeItem,
  updateQty,
  setQty,
  clientId,
  assignedTo
}: PosCartProps) {
  const { user: currentUser } = useAuth();

  return (
    <div className={cn(
      "flex w-full lg:w-96 flex-col rounded-xl border border-border bg-surface lg:h-full shrink-0 overflow-hidden",
      activeTab !== "cart" && "hidden lg:flex"
    )}>
      <div className="border-b border-border p-3 bg-muted/5 rounded-t-xl grid grid-cols-1 gap-3">
        <div>
          <label className="text-[10px] font-extrabold text-muted uppercase tracking-widest mb-1.5 block">Client Selection</label>
          <select
            {...register("clientId", { required: true })}
            className={cn(
              "w-full rounded-md border px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-primary bg-background transition-all",
              errors.clientId ? "border-danger focus:ring-danger" : "border-border focus:border-primary"
            )}
          >
            <option value="">Select Client</option>
            {clients.map(c => (
              <option key={c._id} value={c._id}>{c.shopName} ({c.name})</option>
            ))}
          </select>
        </div>

        {isAdmin && (
          <div className="pt-3 border-t border-border/50 grid grid-cols-2 gap-2">
            <div className="col-span-2">
              <label className="text-[10px] font-extrabold text-muted uppercase tracking-widest mb-1.5 block">Order Mode</label>
              <div className="flex bg-background border border-border rounded-md p-0.5">
                <button
                  type="button"
                  onClick={() => setValue("orderType", "pos")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded transition-all",
                    orderType === "pos" ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"
                  )}
                >
                  <ShoppingCart className="h-3 w-3" /> POS
                </button>
                <button
                  type="button"
                  onClick={() => setValue("orderType", "delivery")}
                  className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-bold rounded transition-all",
                    orderType === "delivery" ? "bg-primary text-primary-foreground" : "text-muted hover:text-foreground"
                  )}
                >
                  <Truck className="h-3 w-3" /> Delivery
                </button>
              </div>
            </div>

            {orderType === "delivery" && (
              <div className="col-span-2">
                <label className="text-[10px] font-extrabold text-muted uppercase tracking-widest mb-1.5 block">Assign To</label>
                <select
                  {...register("assignedTo", { required: orderType === "delivery" })}
                  className="w-full rounded-md border border-border px-2 py-1.5 text-xs shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                >
                  <option value="">Select Salesman</option>
                  {salesmen.map(s => (
                    <option key={s._id} value={s._id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-muted gap-3">
            <ShoppingCart className="h-12 w-12 opacity-20" />
            <p className="font-medium">Your cart is empty</p>
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((item) => {
              const itemId = typeof item.itemId === 'string' ? item.itemId : (item.itemId as any)._id
              return (
                <div key={itemId} className="flex flex-col border-b border-border pb-2 last:border-0 hover:bg-muted/5 -mx-2 px-2 rounded-md transition-colors">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-foreground text-sm line-clamp-1 flex-1">{item.itemName}</p>
                    <button 
                      onClick={() => removeItem(itemId)}
                      className="p-1 text-muted hover:text-danger transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-muted/10 rounded border border-border/50">
                        <button 
                          onClick={() => updateQty(itemId, -1)}
                          className="p-1 hover:bg-background rounded-l border-r border-border/50"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <input 
                          type="number"
                          value={item.quantity}
                          onChange={(e) => setQty(itemId, parseInt(e.target.value) || 0)}
                          onFocus={(e) => e.target.select()}
                          className="w-10 text-center text-[11px] font-extrabold bg-transparent border-none focus:ring-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button 
                          onClick={() => updateQty(itemId, 1)}
                          className="p-1 hover:bg-background rounded-r border-l border-border/50"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <span className="text-[10px] text-muted font-medium">@ {formatCurrency(item.sellingPrice)}</span>
                    </div>
                    <p className="font-extrabold text-foreground text-xs">{formatCurrency(item.subtotal)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="border-t border-border bg-muted/5 p-4 rounded-b-xl">
        <div className="space-y-1 mb-4">
          <div className="flex justify-between text-muted font-medium text-xs">
            <span>Subtotal ({totalItems} items)</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          {/* <div className="flex justify-between items-center text-muted font-medium text-xs pt-1">
            <span className="flex items-center gap-1.5">
              Discount (%)
            </span>
            <div className="relative w-20">
              <span className="absolute right-2 top-1.5 text-[10px] text-muted-foreground font-bold">%</span>
              <input
                type="number"
                {...register("discount", { min: 0, max: 100 })}
                className="w-full rounded-md border-2 border-primary/20 bg-background py-1 pl-2 pr-5 text-right text-xs font-bold text-primary focus:border-primary focus:outline-none focus:ring-0 transition-all placeholder:text-muted/50 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0"
              />
            </div>
          </div> */}
          {/* {Number(subtotal - grandTotal) > 0 && (
            <div className="flex justify-between text-[10px] font-bold text-success/80 italic -mt-0.5">
              <span>Applied Discount</span>
              <span>-{formatCurrency(subtotal - grandTotal)}</span>
            </div>
          )} */}
          <div className="flex justify-between text-lg font-extrabold text-foreground pt-1 border-t border-border mt-1">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(subtotal)}</span>
          </div>
        </div>

        <div className="space-y-3">
          {orderType === "pos" ? (
            <div className="grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="py-5 shadow-sm"
                disabled={items.length === 0 || !clientId || createOrderIsPending}
                onClick={handleSubmit((data: any) => onCheckout(data, false))}
              >
                {createOrderIsPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <>Complete</>
                )}
              </Button>
              <Button
                type="button"
                className="py-5 shadow-md shadow-primary/10"
                disabled={items.length === 0 || !clientId || createOrderIsPending}
                onClick={handleSubmit((data: any) => onCheckout(data, true))}
              >
                {createOrderIsPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <><Printer className="mr-2 h-4 w-4" /> Print</>
                )}
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              className="w-full py-5 text-lg shadow-md shadow-primary/10"
              disabled={items.length === 0 || !clientId || createOrderIsPending}
              onClick={handleSubmit((data: any) => onCheckout(data, false))}
            >
              {createOrderIsPending ? (
                <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Processing</>
              ) : (
                <>
                  <UserCheck className="mr-2 h-5 w-5" /> {
                    currentUser?.role === USER_ROLES.SALES_PERSON ? "Create Order" : "Assign & Create Order"
                  }
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
