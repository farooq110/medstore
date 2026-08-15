import { useState } from "react"
import { useOrders, useMarkItemsProvided, useAddPayment } from "../hooks/use-orders"
import { useClients } from "../hooks/use-clients"
import { useAuth } from "../hooks/use-auth"
import { useDebounce } from "../hooks/use-debounce"
import { formatCurrency, formatDate } from "../lib/utils"
import { MapPin, Phone, CheckCircle, Loader2, Search } from "lucide-react"
import { User, USER_ROLES } from "../types"
import { Button } from "../components/ui/button"
import { Skeleton } from "../components/ui/skeleton"
import { MultiSelect } from "../components/ui/multi-select"
import { errorMessage, successMessage } from "../lib/notifications"

function SkeletonLoading({ i }: { i: number }) {
  return (
    <div key={i} className="flex flex-col rounded-xl border border-border bg-background p-6 shadow-sm">
      <div className="mb-4 flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="text-right space-y-2">
          <Skeleton className="h-4 w-16 ml-auto" />
          <Skeleton className="h-3 w-20 ml-auto" />
        </div>
      </div>
      <div className="mb-6 space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <div className="mt-2 border-t border-border pt-2 space-y-2">
          <Skeleton className="h-4 w-1/4" />
          <div className="space-y-1">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-3 w-1/3" />
          </div>
        </div>
      </div>
      <Skeleton className="mt-auto h-10 w-full" />
    </div>
  )
}

export function Delivery() {
  const { user } = useAuth()

  const [searchQuery, setSearchQuery] = useState("")
  const debouncedSearch = useDebounce(searchQuery)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)

  const { data: response, isLoading } = useOrders({
    limit: 100,
    search: debouncedSearch,
    clientIds: selectedClientId ? [selectedClientId] : undefined,
    type: "delivery"
  })

  const { data: clientsResponse } = useClients({ limit: 1000 })
  const clientOptions = clientsResponse?.data.map(c => ({
    label: c.shopName,
    value: c._id,
    description: c.name
  })) || []

  const orders = response?.data || []
  const markProvided = useMarkItemsProvided()
  const addPayment = useAddPayment()

  const [activeOrderId, setActiveOrderId] = useState<string | null>(null)
  const [paymentAmount, setPaymentAmount] = useState<number | "">("")
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")

  // Show created or assigned delivery orders. 
  // If salesperson, show only theirs. If owner, show all.
  const deliveryOrders = orders.filter(o => {
    if (o.isDelivered) return false;
    const isDelivery = o.orderType === "delivery"
    const isPending = o.orderStatus === "created" || o.orderStatus === "assigned"
    const isMine = user?.role === USER_ROLES.OWNER || (o.assignedTo as User)?._id === user?._id
    return isDelivery && isPending && isMine
  })

  const handleConfirmDelivery = async (orderId: string) => {
    const amountToPay = typeof paymentAmount === "number" ? paymentAmount : 0

    try {
      if (amountToPay > 0) {

        await addPayment.mutateAsync({
          id: orderId,
          data: {
            amount: amountToPay,
            method: paymentMethod,
            notes: "Paid during delivery"
          }
        })
      }

      await markProvided.mutateAsync(orderId)

      setActiveOrderId(null)
      setPaymentAmount("")
      successMessage("Delivery confirmed successfully")
    } catch (error) {
      errorMessage("Delivery confirmation failed")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pending Deliveries</h1>
        <p className="text-sm text-muted">
          {isLoading ? (
            <Skeleton className="h-4 w-48" />
          ) : (
            `You have ${deliveryOrders.length} orders to provide.`
          )}
        </p>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="flex-1 sm:max-w-xs">
          <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1 block">Search Order #</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by Order #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-border bg-background pl-9 pr-4 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <div className="flex-1 sm:max-w-sm">
          <MultiSelect
            label="Filter by Client"
            options={clientOptions}
            value={selectedClientId ? [selectedClientId] : []}
            onChange={(values) => setSelectedClientId(values[0] || null)}
            placeholder="Select client..."
            multiple={false}
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <SkeletonLoading i={i} />
          ))
        ) : (
          <>
            {deliveryOrders.map(order => {
              const client = typeof order.client === 'string' ? null : order.client
              const isExpanded = activeOrderId === order._id

              return (
                <div key={order._id} className="flex flex-col rounded-xl border border-border bg-background p-6 shadow-sm">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground line-clamp-1">{client?.shopName}</h3>
                      <p className="text-sm text-muted">{order.orderNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{formatCurrency(order.dueAmount)}</p>
                      <p className="text-xs text-muted">Due Amount</p>
                    </div>
                  </div>

                  <div className="mb-6 space-y-2 text-sm text-muted">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 shrink-0 text-muted" />
                      <span className="line-clamp-1">{client?.address || "No address"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0 text-muted" />
                      <span>{client?.phone || "No phone"}</span>
                    </div>
                    <div className="mt-2 border-t border-border pt-2">
                      <div className="flex justify-between items-center mb-1">
                        <p className="font-medium text-foreground">{order.items.length} items</p>
                        <span className="text-xs text-muted">{formatDate(order.createdAt)}</span>
                      </div>
                      <ul className="mt-1 list-inside list-disc text-xs space-y-1">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <li key={idx} className="line-clamp-1">{item.quantity}x {item.itemName}</li>
                        ))}
                        {order.items.length > 3 && <li className="list-none text-primary">...and {order.items.length - 3} more</li>}
                      </ul>
                    </div>
                  </div>

                  <div className="mt-auto pt-4">
                    {isExpanded ? (
                      <div className="space-y-4 rounded-lg bg-muted/5 p-4 dark:bg-gray-800/50">
                        <div>
                          <label className="text-xs font-medium text-muted">Collection Amount</label>
                          <input
                            type="number"
                            value={paymentAmount}
                            onChange={(e) => setPaymentAmount(e.target.value ? parseFloat(e.target.value) : "")}
                            placeholder={order.dueAmount.toString()}
                            className="mt-1 block w-full rounded-lg border border-border bg-background px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                        </div>
                        <div className="flex gap-2">
                          {["cash", "bank_transfer"].map((method) => (
                            <Button
                              key={method}
                              variant={paymentMethod === method ? "primary" : "outline"}
                              size="sm"
                              className="flex-1 text-[10px] uppercase tracking-wider"
                              onClick={() => setPaymentMethod(method)}
                            >
                              {method.replace('_', ' ')}
                            </Button>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            variant="ghost"
                            className="flex-1"
                            onClick={() => setActiveOrderId(null)}
                          >
                            Cancel
                          </Button>
                          <Button
                            className="flex-1 bg-success hover:bg-success/90"
                            onClick={() => handleConfirmDelivery(order._id)}
                            disabled={markProvided.isPending || addPayment.isPending}
                          >
                            {markProvided.isPending ? "Updating..." : "Confirm"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={() => {
                          setActiveOrderId(order._id)
                          setPaymentAmount(order.dueAmount)
                          setPaymentMethod("cash")
                        }}
                        className="w-full"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" /> Mark Items Provided
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
            {deliveryOrders.length === 0 && (
              <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center">
                <CheckCircle className="mx-auto h-12 w-12 text-muted" />
                <h3 className="mt-2 text-sm font-semibold text-foreground">All caught up!</h3>
                <p className="mt-1 text-sm text-muted">No pending deliveries for you right now.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
