import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useOrder, useMarkItemsProvided, useAddPayment, useAssignOrder } from "../hooks/use-orders"
import { useAuth } from "../hooks/use-auth"
import { useUsers } from "../hooks/use-users"
import { Badge } from "../components/ui/badge"
import { Modal } from "../components/ui/modal"
import { Button } from "../components/ui/button"
import { formatCurrency, formatDate } from "../lib/utils"
import { ArrowLeft, CheckCircle, CreditCard, UserCheck, Printer, Share2, Clipboard } from "lucide-react"
import { OrderStatus, USER_ROLES, Order, Client } from "../types"
import { successMessage, errorMessage } from "../lib/notifications"
import { PrintableInvoice } from "../components/invoice/printable-invoice"
import { ShareModal } from "../components/invoice/share-modal"
import { Download } from "lucide-react"
import { Skeleton } from "../components/ui/skeleton"
import AssignSalesmanModal from "../components/order/assign-salesman"
import PaymentModal from "../components/order/payment-modal"

export function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const { data: order, isLoading } = useOrder(id!)
  const { data: usersResponse } = useUsers({ limit: 100 })
  const salesPersons = usersResponse?.data.filter(u => u.role === USER_ROLES.SALES_PERSON) || []

  const markProvided = useMarkItemsProvided()
  const addPayment = useAddPayment()
  const assignOrder = useAssignOrder()

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState<number | "">("")
  const [paymentMethod, setPaymentMethod] = useState<string>("cash")
  const [paymentNotes, setPaymentNotes] = useState("")

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false)
  const [isShareModalOpen, setIsShareModalOpen] = useState(false)
  const [selectedSalesPersonId, setSelectedSalesPersonId] = useState("")
  const [assignFor, setAssignFor] = useState<"delivery" | "payment_collection">("delivery")

  const isAdmin = user?.role === USER_ROLES.OWNER
  const [isPrinting, setIsPrinting] = useState(false)

  const handlePrint = () => {
    setIsPrinting(true)
    setTimeout(() => {
      window.print()
      setIsPrinting(false)
    }, 500)
  }

  const handleAddPayment = async () => {
    if (!order || !paymentAmount || paymentAmount <= 0) return

    await addPayment.mutateAsync({
      id: order._id,
      data: {
        amount: paymentAmount,
        method: paymentMethod,
        notes: paymentNotes
      }
    })

    successMessage("Payment Added", `Payment of ${formatCurrency(paymentAmount)} recorded successfully.`)
    setIsPaymentModalOpen(false)
    setPaymentAmount("")
    setPaymentNotes("")
  }

  const handleMarkProvided = async () => {
    if (!order) return
    try {
      await markProvided.mutateAsync(order._id)
      successMessage("Items Provided", "Order status updated to items provided.")
    } catch (error: any) {
      errorMessage("Action Failed", error.message || "Could not update order status")
    }
  }

  const handleAssign = async () => {
    if (!order || !selectedSalesPersonId) return

    try {
      await assignOrder.mutateAsync({
        id: order._id,
        data: {
          salesPersonId: selectedSalesPersonId,
          assignFor
        }
      })
      successMessage("Order Assigned", `Order assigned to agent for ${assignFor.replace('_', ' ')}.`)
      setIsAssignModalOpen(false)
      setSelectedSalesPersonId("")
    } catch (error: any) {
      errorMessage("Assignment Failed", error.message || "Something went wrong")
    }
  }

  if (!isLoading && !order) return <div className="py-8 text-center text-red-500">Order not found</div>

  const statusVariants: Record<OrderStatus, any> = {
    created: "warning",
    assigned: "info",
    items_provided: "success",
    completed: "success",
    backorder: "danger"
  }

  const clientName = order && order.client ? (order.client as Client).name : "Deactivated Client"

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate(-1)}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
          ) : order && (
            <>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{order.orderNumber}</h1>
                <Badge variant={statusVariants[order.orderStatus]} className="capitalize">{order.orderStatus.replace('_', ' ')}</Badge>
                <Badge variant="default" className="capitalize">{order.orderType}</Badge>
              </div>
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <Link
                  to={`/clients/${(order.client as Client)._id}`}
                  className="font-semibold text-primary hover:underline hover:text-primary/80 transition-colors"
                >
                  {clientName}
                </Link>
                <span>•</span>
                <span>{formatDate(order.createdAt)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Items</h2>
            <div className="overflow-x-auto">
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex justify-between border-b border-border pb-3">
                      <Skeleton className="h-4 w-1/3" />
                      <Skeleton className="h-4 w-12" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              ) : order && (
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                  <thead className="border-b border-gray-100 text-xs uppercase text-gray-500 dark:border-gray-800">
                    <tr>
                      <th className="pb-3 font-medium">Item</th>
                      <th className="pb-3 font-medium text-right">Qty</th>
                      <th className="pb-3 font-medium text-right">Price</th>
                      <th className="pb-3 font-medium text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {order.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="py-3">{item.itemName}</td>
                        <td className="py-3 text-right">{item.quantity}</td>
                        <td className="py-3 text-right">{formatCurrency(item.sellingPrice)}</td>
                        <td className="py-3 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Payment History</h2>
            {isLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="flex justify-between border-b border-border pb-3">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            ) : !order?.payments || order.payments.length === 0 ? (
              <p className="text-sm text-gray-500">No payments recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-600 dark:text-gray-300">
                  <thead className="border-b border-gray-100 text-xs uppercase text-gray-500 dark:border-gray-800">
                    <tr>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Method</th>
                      <th className="pb-3 font-medium text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {order.payments.map((payment, idx) => (
                      <tr key={idx}>
                        <td className="py-3">{formatDate(payment.recordedAt)}</td>
                        <td className="py-3 capitalize">{payment.method}</td>
                        <td className="py-3 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(payment.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {order?.assignedTo && (
            <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
              <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Assignment</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Assigned To</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {typeof order.assignedTo === 'string' ? order.assignedTo : order.assignedTo.name}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Task Type</span>
                  <Badge variant="info" className="capitalize">
                    {order.assignedFor?.replace('_', ' ')}
                  </Badge>
                </div>
                {order.assignedAt && (
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Assigned At</span>
                    <span>{formatDate(order.assignedAt)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-gray-100 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">Summary</h2>
            {isLoading ? (
              <div className="space-y-4">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-16" />
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between">
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ) : order && (
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Subtotal</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Discount</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                  <span>Total Paid</span>
                  <span>{formatCurrency(order.paidAmount)}</span>
                </div>
                <div className="border-t border-gray-100 pt-3 flex justify-between font-semibold text-gray-900 dark:border-gray-800 dark:text-white text-lg">
                  <span>Due Amount</span>
                  <span className={order?.dueAmount > 0 ? "text-red-600" : "text-green-600"}>
                    {formatCurrency(order?.dueAmount)}
                  </span>
                </div>
              </div>
            )}

            <div className="mt-6 space-y-3">
              {isAdmin && order?.orderStatus && order.orderStatus !== "completed" && (
                <Button
                  onClick={() => {
                    setSelectedSalesPersonId(typeof order.assignedTo === 'string' ? order.assignedTo : (order.assignedTo?._id || ""))
                    setAssignFor(order.assignedFor || (order.isDelivered ? "payment_collection" : "delivery"))
                    setIsAssignModalOpen(true)
                  }}
                  variant="primary"
                  className="w-full"
                >
                  <UserCheck className="mr-2 h-4 w-4" /> Assign Salesman
                </Button>
              )}

              {order && (order.orderStatus === "created" || order.orderStatus === "assigned") && order.orderType === "delivery" && (
                <Button
                  onClick={handleMarkProvided}
                  disabled={markProvided.isPending}
                  className="w-full"
                  variant="outline"
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> Mark Items Provided
                </Button>
              )}

              {order && order?.dueAmount > 0 && (
                <Button
                  onClick={() => {
                    setPaymentAmount(order?.dueAmount)
                    setIsPaymentModalOpen(true)
                  }}
                  variant="outline"
                  className="w-full"
                >
                  <CreditCard className="mr-2 h-4 w-4" /> Add Payment
                </Button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <Link to={`/public/invoice/${order?._id}/${order?.shareToken}`} target="_blank">
                  <Button
                    variant="outline"
                    className="w-full flex-col h-14 gap-1 p-0"
                  >
                    <Clipboard className="h-4 w-4" />
                    <span className="text-[10px] uppercase font-bold tracking-tight">Invoice</span>
                  </Button>
                </Link>

                <Button
                  variant="primary"
                  className="w-full flex-col h-14 gap-1 p-0 shadow-lg shadow-primary/20"
                  onClick={() => setIsShareModalOpen(true)}
                >
                  <Share2 className="h-4 w-4" />
                  <span className="text-[10px] uppercase font-bold tracking-tight">Share</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {order && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          order={order as Order}
        />
      )}

      {order && user?.business && (
        <PrintableInvoice
          order={order as Order}
          client={typeof order.client === 'object' ? order.client : null}
          businessInfo={user.business as any}
        />
      )}

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSubmit={handleAddPayment}
        paymentAmount={paymentAmount}
        setPaymentAmount={setPaymentAmount}
        paymentMethod={paymentMethod}
        setPaymentMethod={setPaymentMethod}
        paymentNotes={paymentNotes}
        setPaymentNotes={setPaymentNotes}
        order={order as Order}
        addPayment={addPayment}
      />

      <AssignSalesmanModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        selectedSalesPersonId={selectedSalesPersonId}
        setSelectedSalesPersonId={setSelectedSalesPersonId}
        assignFor={assignFor}
        setAssignFor={setAssignFor}
        assignOrder={assignOrder}
        onSubmit={() => {
          handleAssign()
          setIsAssignModalOpen(false)
        }}
        salesPersons={salesPersons}
      />
    </div>
  )
}


