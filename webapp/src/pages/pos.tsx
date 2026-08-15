import { useState } from "react"
import { useForm } from "react-hook-form"
import { useCreateOrder } from "../hooks/use-orders"
import { useItems } from "../hooks/use-items"
import { useClients } from "../hooks/use-clients"
import { useUsers } from "../hooks/use-users"
import { useCategories } from "../hooks/use-categories"
import { useDebounce } from "../hooks/use-debounce"
import { useAuth } from "../hooks/use-auth"
import { successMessage, errorMessage } from "../lib/notifications"
import { OrderItem, OrderType, USER_ROLES } from "../types"
import { cn } from "../lib/utils"
import { Package, ShoppingCart, Loader2 } from "lucide-react"

import { PosProductGrid } from "../components/pos/pos-product-grid"
import { PosCart } from "../components/pos/pos-cart"
import { PrintableInvoice } from "../components/invoice/printable-invoice"
import { Order } from "../types"
import { useEffect } from "react"

interface POSForm {
  clientId: string
  orderType: OrderType
  assignedTo: string
  discount: number
}

export function POS() {
  const { user: currentUser } = useAuth()
  const createOrder = useCreateOrder()

  const isAdmin = currentUser?.role === USER_ROLES.OWNER

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([])
  const debouncedSearch = useDebounce(searchQuery, 300)

  // Server-side filtering
  const { data: itemsResponse, isLoading: itemsLoading } = useItems({
    limit: 100,
    search: debouncedSearch,
    categoryIds: selectedCategoryIds.length > 0 ? selectedCategoryIds : undefined
  })
  const storeItems = itemsResponse?.data || []

  const { data: clientsResponse, isLoading: clientsLoading } = useClients({ limit: 1000 })
  const clients = clientsResponse?.data || []

  const { data: usersResponse } = useUsers({ limit: 1000 })
  const users = usersResponse?.data || []

  const { data: categoriesResponse } = useCategories({ limit: 100 })
  const categories = categoriesResponse?.data || []

  const salesmen = users.filter(u => u.role === USER_ROLES.SALES_PERSON && u.isActive)

  const [items, setItems] = useState<OrderItem[]>([])
  const [activeTab, setActiveTab] = useState<"products" | "cart">("products")
  const [addedItemId, setAddedItemId] = useState<string | null>(null)
  const [printingOrder, setPrintingOrder] = useState<Order | null>(null)

  useEffect(() => {
    if (printingOrder) {
      // Small delay to ensure the DOM is updated with the invoice data
      const timer = setTimeout(() => {
        window.print()
        // Reset printing order after print dialog opens so it can be re-triggered
        setPrintingOrder(null)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [printingOrder])

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm<POSForm>({
    defaultValues: {
      clientId: "",
      orderType: "delivery",
      assignedTo: undefined,
      discount: 0
    }
  })

  const clientId = watch("clientId")
  const orderType = watch("orderType")
  const assignedTo = watch("assignedTo")

  useEffect(() => {
    if (!clientId) return
    const selectedClient = clients.find(c => c._id === clientId)
    if (selectedClient?.salesPerson?._id) {
      setValue("assignedTo", selectedClient.salesPerson._id)
    }
  }, [clientId, clients, setValue])

  const handleAddItem = (item: typeof storeItems[0]) => {
    const existing = items.find(i => (typeof i.itemId === 'string' ? i.itemId : (i.itemId as any)._id) === item._id)
    if (existing) {
      if (existing.quantity >= item.stockQuantity) return
      setItems(items.map(i =>
        (typeof i.itemId === 'string' ? i.itemId : (i.itemId as any)._id) === item._id
          ? { ...i, quantity: i.quantity + 1, subtotal: (i.quantity + 1) * i.sellingPrice }
          : i
      ))
    } else {
      if (item.stockQuantity <= 0) return
      setItems([...items, {
        itemId: item._id,
        itemName: item.name,
        quantity: 1,
        sellingPrice: item.sellingPrice,
        subtotal: item.sellingPrice,
        isBackorder: false
      }])
    }

    setAddedItemId(item._id)
    setTimeout(() => setAddedItemId(null), 1000)
  }

  const updateQty = (itemId: string, delta: number) => {
    setItems(items.map(i => {
      if ((typeof i.itemId === 'string' ? i.itemId : (i.itemId as any)._id) === itemId) {
        const item = storeItems.find(si => si._id === itemId)
        const maxStock = item?.stockQuantity || 0
        const newQty = Math.min(maxStock, Math.max(1, i.quantity + delta))
        return { ...i, quantity: newQty, subtotal: newQty * i.sellingPrice }
      }
      return i
    }))
  }

  const setQty = (itemId: string, value: number) => {
    setItems(items.map(i => {
      if ((typeof i.itemId === 'string' ? i.itemId : (i.itemId as any)._id) === itemId) {
        const item = storeItems.find(si => si._id === itemId)
        const maxStock = item?.stockQuantity || 0
        const newQty = Math.min(maxStock, Math.max(1, value))
        return { ...i, quantity: newQty, subtotal: newQty * i.sellingPrice }
      }
      return i
    }))
  }

  const removeItem = (itemId: string) => {
    setItems(items.filter(i => (typeof i.itemId === 'string' ? i.itemId : (i.itemId as any)._id) !== itemId))
  }

  const subtotal = items.reduce((sum, i) => sum + i.subtotal, 0)
  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0)

  const onCheckout = async (data: POSForm, shouldPrint: boolean) => {
    if (items.length === 0) return

    const orderData = {
      clientId: data.clientId,
      orderType: data.orderType,
      items: items.map(i => ({
        itemId: typeof i.itemId === 'string' ? i.itemId : (i.itemId as any)._id,
        itemName: i.itemName,
        quantity: i.quantity,
        sellingPrice: i.sellingPrice
      })),
      notes: data.orderType === "pos" ? "POS Order" : "Delivery Order",
      assignedTo: isAdmin ? (data.assignedTo ?? undefined) : currentUser?._id,
      assignedFor: "delivery",
      discount: Number(data.discount) || 0
    }

    try {
      const response = await createOrder.mutateAsync(orderData)
      successMessage("Order Created", `${data.orderType.toUpperCase()} order has been recorded.`)

      const createdOrder = response.data

      setItems([])
      reset({
        clientId: "",
        orderType: "pos",
        assignedTo: "",
        discount: 0
      })
      setActiveTab("products")

      if (shouldPrint && createdOrder) {
        // Find client name for filename
        const client = clients.find(c => c._id === createdOrder.client || (typeof createdOrder.client === 'object' && createdOrder.client._id === c._id))
        const clientNameForFile = (client?.name || "Customer").replace(/[^a-z0-9]/gi, '_')
        const orderSuffix = createdOrder.orderNumber.slice(-5)

        const originalTitle = document.title
        document.title = `${clientNameForFile}_${orderSuffix}`

        setPrintingOrder(createdOrder)

        // The useEffect in POS handles the window.print(), but we need to reset title after
        // Since window.print() is blocking, we can reset after
        setTimeout(() => {
          document.title = originalTitle
        }, 1000)
      }
    } catch (error: any) {
      errorMessage("Checkout Failed", error.message || "Something went wrong")
      console.error("Checkout failed:", error)
    }
  }


  return (
    <div className="flex flex-col lg:flex-row lg:h-[calc(100vh-5rem)] gap-6 relative">
      <div className="flex lg:hidden w-full bg-surface border border-border rounded-xl p-1 mb-2">
        <button
          onClick={() => setActiveTab("products")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all",
            activeTab === "products" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted hover:bg-muted/5"
          )}
        >
          <Package className="h-4 w-4" /> Products
        </button>
        <button
          onClick={() => setActiveTab("cart")}
          className={cn(
            "flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all relative",
            activeTab === "cart" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted hover:bg-muted/5"
          )}
        >
          <ShoppingCart className="h-4 w-4" /> Cart
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-danger text-[10px] text-white animate-pulse">
              {totalItems}
            </span>
          )}
        </button>
      </div>

      <PosProductGrid
        items={storeItems}
        isLoading={itemsLoading}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        setSelectedCategoryIds={setSelectedCategoryIds}
        handleAddItem={handleAddItem}
        addedItemId={addedItemId}
        activeTab={activeTab}
        totalItems={totalItems}
        setActiveTab={setActiveTab}
      />

      <PosCart
        items={items}
        activeTab={activeTab}
        clients={clients}
        salesmen={salesmen}
        isAdmin={isAdmin}
        orderType={orderType}
        subtotal={subtotal}
        totalItems={totalItems}
        createOrderIsPending={createOrder.isPending}
        register={register}
        errors={errors}
        setValue={setValue}
        handleSubmit={handleSubmit}
        onCheckout={onCheckout}
        removeItem={removeItem}
        updateQty={updateQty}
        setQty={setQty}
        clientId={clientId}
        assignedTo={assignedTo}
      />

      <PrintableInvoice
        order={printingOrder}
        client={clients.find(c => c._id === printingOrder?.client || (typeof printingOrder?.client === "object" && printingOrder?.client?._id === c._id))}
      />
    </div>
  )
}
