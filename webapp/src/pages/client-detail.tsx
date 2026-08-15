import { useParams, useNavigate, Link } from "react-router-dom"
import { useClientDetail } from "../hooks/use-clients"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { DataTable } from "../components/ui/data-table"
import { RecentClientOrder } from "../types"
import { formatCurrency, formatDate } from "../lib/utils"
import {
  ArrowLeft,
  Store,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  TrendingUp,
  ShoppingCart,
  CheckCircle,
  Clock,
  AlertTriangle,
  Calendar,
  ArrowRight,
  UserCheck
} from "lucide-react"
import { PaymentStatus } from "../constants/roles"

export function ClientDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, isLoading, error } = useClientDetail(id!)

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-lg bg-gray-200 dark:bg-gray-800" />
          <div className="space-y-2">
            <div className="h-6 w-48 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-4 w-32 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
        </div>

        {/* Main Grid Skeleton */}
        <div className="grid gap-6 md:grid-cols-3">
          <div className="h-80 rounded-xl bg-gray-200 dark:bg-gray-800 md:col-span-1" />
          <div className="h-80 rounded-xl bg-gray-200 dark:bg-gray-800 md:col-span-2" />
        </div>

        {/* Orders Skeleton */}
        <div className="h-64 rounded-xl bg-gray-200 dark:bg-gray-800" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-[400px] flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-border bg-surface text-center px-4">
        <AlertTriangle className="h-10 w-10 text-danger" />
        <h3 className="text-lg font-semibold text-foreground">Failed to load client details</h3>
        <p className="text-sm text-muted">Please check your connection and try again.</p>
        <Button onClick={() => navigate("/clients")} variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Clients
        </Button>
      </div>
    )
  }

  const { client, analytics, recentOrders } = data
  const { credit, orders, payment } = analytics

  const orderColumns = [
    {
      header: "Order #",
      accessor: "orderNumber" as keyof RecentClientOrder,
      className: "font-semibold text-primary"
    },
    {
      header: "Date",
      accessor: (row: RecentClientOrder) => formatDate(row.createdAt),
      className: "text-muted"
    },
    {
      header: "Total Amount",
      accessor: (row: RecentClientOrder) => formatCurrency(row.totalAmount),
      className: "font-medium"
    },
    {
      header: "Due Amount",
      accessor: (row: RecentClientOrder) => (
        <span className={row.dueAmount > 0 ? "text-danger font-semibold" : "text-muted"}>
          {formatCurrency(row.dueAmount)}
        </span>
      )
    },
    {
      header: "Order Status",
      accessor: (row: RecentClientOrder) => {
        const statusVariants: Record<string, "default" | "success" | "warning" | "danger" | "info" | "primary"> = {
          created: "warning",
          assigned: "info",
          items_provided: "success",
          completed: "success",
          backorder: "danger"
        }
        return (
          <Badge variant={statusVariants[row.orderStatus] || "default"}>
            {row.orderStatus.replace("_", " ")}
          </Badge>
        )
      }
    },
    {
      header: "Payment Status",
      accessor: (row: RecentClientOrder) => {
        const paymentVariants: Record<string, "default" | "success" | "warning" | "danger" | "info" | "primary"> = {
          pending: "warning",
          partial: "primary",
          fully_paid: "success",
          borrow: "danger"
        }
        return (
          <Badge variant={paymentVariants[row.paymentStatus] || "default"}>
            {PaymentStatus[row.paymentStatus]}
          </Badge>
        )
      }
    }
  ]

  // Calculate utilization color
  const utilization = credit.utilization || 0
  let progressColor = "bg-success"
  let progressBg = "bg-success/10"
  let textColor = "text-success"

  if (utilization >= 100) {
    progressColor = "bg-danger"
    progressBg = "bg-danger/10"
    textColor = "text-danger"
  } else if (utilization >= 80) {
    progressColor = "bg-warning"
    progressBg = "bg-warning/10"
    textColor = "text-warning"
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-lg border border-border hover:bg-muted/10"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {client.shopName}
              </h1>
              <Badge variant={client.isActive ? "success" : "default"}>
                {client.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-muted dark:text-gray-400">
              Client details and activity report
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:col-span-1">
          <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <Store className="h-5 w-5 text-primary" /> Shop Profile
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="h-5 w-5 text-muted mt-0.5" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted/80">Owner Name</p>
                <p className="text-sm font-medium text-foreground">{client.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-muted mt-0.5" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted/80">Phone</p>
                <p className="text-sm font-medium text-foreground">{client.phone || "No phone number"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-muted mt-0.5" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted/80">Email</p>
                <p className="text-sm font-medium text-foreground break-all">{client.email || "No email address"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted mt-0.5" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted/80">Address</p>
                <p className="text-sm font-medium text-foreground">{client.address || "No address"}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="h-5 w-5 text-muted mt-0.5" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted/80">Ntn</p>
                <p className="text-sm font-medium text-foreground">{client.ntn || "No ntn"}</p>
              </div>
            </div>

            {client.salesPerson && (
              <div className="flex items-start gap-3 pt-3 border-t border-border">
                <UserCheck className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted/80">Sales Representative</p>
                  <p className="text-sm font-medium text-foreground">{client.salesPerson.name}</p>
                  <p className="text-xs text-muted">{client.salesPerson.email}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:col-span-2 flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" /> Credit Status
            </h2>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between items-baseline">
                <span className="text-sm font-medium text-muted">Credit Utilization</span>
                <span className={`text-lg font-bold ${textColor}`}>
                  {utilization.toFixed(1)}%
                </span>
              </div>
              <div className="w-full h-3 bg-muted/20 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${progressColor} transition-all duration-500`}
                  style={{ width: `${Math.min(utilization, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted">
                <span>0%</span>
                <span>80% Warning</span>
                <span>100% Limit</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/5 dark:bg-gray-800/40">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Credit Limit</p>
                <p className="text-xl font-bold mt-1 text-foreground">
                  {formatCurrency(credit.creditLimit)}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/5 dark:bg-gray-800/40">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Outstanding Balance</p>
                <p className="text-xl font-bold mt-1 text-danger">
                  {formatCurrency(credit.outstanding)}
                </p>
              </div>

              <div className="p-4 rounded-lg bg-muted/5 dark:bg-gray-800/40">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Available Credit</p>
                <p className="text-xl font-bold mt-1 text-success">
                  {formatCurrency(credit.available)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border flex justify-between items-center text-xs text-muted">
            <span>Credit limit and usage are calculated in real-time.</span>
            {utilization > 100 && (
              <span className="text-danger font-medium flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" /> Over Credit Limit
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" /> Order & Payment Summary
        </h2>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted">Total Orders</p>
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <p className="text-2xl font-bold mt-2 text-foreground">{orders.total}</p>
            <div className="mt-2 text-xs text-muted flex items-center gap-1.5 flex-wrap">
              <span className="text-success font-semibold">{orders.completed} Completed</span>
              {orders.pending > 0 && <>
                <span>•</span>
                <button
                  onClick={() => navigate(`/orders?clients=${client._id}&status=assigned`)}
                  className="text-warning font-semibold hover:underline cursor-pointer"
                >
                  {orders.pending} Pending
                </button>
              </>
              }
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted">Average Order Value</p>
              <span className="text-sm font-bold text-primary">$</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-foreground">
              {formatCurrency(orders.avgOrderValue)}
            </p>
            <p className="mt-2 text-xs text-muted">Across all completed/pending orders</p>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted">Payment Collection Rate</p>
              <span className="text-sm font-bold text-primary">%</span>
            </div>
            <p className="text-2xl font-bold mt-2 text-foreground">
              {payment.paymentRate.toFixed(1)}%
            </p>
            <div className="mt-2 w-full h-1.5 bg-muted/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary"
                style={{ width: `${Math.min(payment.paymentRate, 100)}%` }}
              />
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted">Financial Overview</p>
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted">Total Invoiced:</span>
                <span className="font-semibold text-foreground">{formatCurrency(payment.totalAmount)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted">Total Paid:</span>
                <span className="font-semibold text-success">{formatCurrency(payment.totalPaid)}</span>
              </div>
              <div className="flex justify-between text-xs border-t border-border pt-1">
                <span className="text-muted">Outstanding:</span>
                <span className="font-semibold text-danger">{formatCurrency(payment.totalDue)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" /> Recent Orders
          </h2>
          <Button
            onClick={() => navigate(`/orders?clients=${client._id}`)}
            variant="link"
            className="text-primary hover:text-primary-hover p-0 h-auto self-start sm:self-center font-semibold"
          >
            View All Client Orders <ArrowRight className="ml-1.5 h-4 w-4" />
          </Button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="flex h-32 flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border bg-surface text-center">
            <p className="text-sm text-muted italic">No orders found for this client.</p>
            <Button size="sm" onClick={() => navigate("/pos")}>
              Create Order
            </Button>
          </div>
        ) : (
          <DataTable
            data={recentOrders.slice(0, 3)}
            columns={orderColumns}
            onRowClick={(order) => navigate(`/orders/${order._id}`)}
          />
        )}
      </div>
    </div>
  )
}
