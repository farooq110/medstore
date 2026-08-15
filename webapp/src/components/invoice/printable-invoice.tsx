import { Order, Client, OrderItem, User } from "../../types"
import { formatCurrency, formatDate } from "../../lib/utils"
import { PaymentStatus } from "@/src/constants/roles"

interface PrintableInvoiceProps {
  order: Order | null
  client?: Client | null
  businessInfo?: {
    name: string
    address: string
    phone: string
    email: string
    logo?: string
  }
}

export function PrintableInvoice({ order, client, businessInfo }: PrintableInvoiceProps) {
  if (!order || !businessInfo) return null

  // Ensure client data is available even if not passed separately (Order has client field)
  const orderClient = client || (typeof order.client === "object" ? order.client : null)

  return (
    <div id="printable-invoice" className="hidden print:block w-full max-w-4xl mx-auto p-8 bg-white text-slate-900 font-sans">
      {/* Header */}
      <div className="flex justify-between items-start border-b-2 border-slate-200 pb-8 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight uppercase mb-1">{businessInfo.name}</h1>
          <div className="mt-4 space-y-0.5 text-xs text-slate-600">
            <p>{businessInfo.address}</p>
            <p>Phone: {businessInfo.phone}</p>
            <p>Email: {businessInfo.email}</p>
          </div>
        </div>
        <div className="text-right">
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
            <h2 className="text-xl font-bold text-slate-800 uppercase tracking-wider mb-2">Tax Invoice</h2>
            <div className="space-y-1 text-sm">
              <p className="flex justify-between gap-4"><span className="text-slate-500 font-medium">Invoice No:</span> <span className="font-bold">#{order.orderNumber}</span></p>
              <p className="flex justify-between gap-4"><span className="text-slate-500 font-medium">Date:</span> <span className="font-bold">{formatDate(order.createdAt)}</span></p>
              <p className="flex justify-between gap-4"><span className="text-slate-500 font-medium">Status:</span> <span className="font-bold uppercase text-xs px-2 py-0.5 bg-slate-200 rounded">{PaymentStatus[order.paymentStatus]}</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-10">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-3">Bill To</h3>
        <div className="text-slate-800">
          {orderClient?.shopName && <p className="text-lg font-bold">{orderClient.shopName}</p>}
          <p className="font-medium text-slate-700">{orderClient?.name || "Cash Customer"}</p>
          {orderClient?.address && <p className="text-sm text-slate-600 mt-1 max-w-xs">{orderClient.address}</p>}
          {orderClient?.phone && <p className="text-sm text-slate-600 mt-1">Contact: {orderClient.phone}</p>}
          {orderClient?.ntn && <p className="text-sm text-slate-600 mt-1">Ntn: {orderClient.ntn}</p>}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-10 border-collapse">
        <thead>
          <tr className="border-b-2 border-slate-800 text-left text-xs font-bold uppercase tracking-wider text-slate-600">
            <th className="py-3 px-2 w-12 text-center">#</th>
            <th className="py-3 px-2">Description / Medicine Name</th>
            <th className="py-3 px-2 text-right">Unit Price</th>
            <th className="py-3 px-2 text-center w-24">Qty</th>
            <th className="py-3 px-2 text-right w-32">Amount</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {order.items.map((item, index) => (
            <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
              <td className="py-4 px-2 text-center text-slate-400 font-medium">{index + 1}</td>
              <td className="py-4 px-2">
                <p className="font-bold text-slate-800">{item.itemName}</p>
                {/* Medicine suppliers often have batch/expiry info, but we'll stick to what we have */}
              </td>
              <td className="py-4 px-2 text-right text-slate-600">{formatCurrency(item.sellingPrice)}</td>
              <td className="py-4 px-2 text-center font-bold text-slate-800">{item.quantity}</td>
              <td className="py-4 px-2 text-right font-bold text-slate-800">{formatCurrency(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div className="flex justify-end pr-2">
        <div className="w-80 space-y-3">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 font-medium">Subtotal</span>
            <span className="font-bold text-slate-800">{formatCurrency(order.subtotal)}</span>
          </div>

          {order.discount > 0 && (
            <div className="flex justify-between items-center text-sm text-green-600 bg-green-50 px-3 py-2 rounded">
              <span className="font-medium">Discount ({order.discount}%)</span>
              <span className="font-bold">-{formatCurrency((order.subtotal * order.discount) / 100)}</span>
            </div>
          )}

          <div className="flex justify-between items-center bg-slate-900 text-white p-4 rounded-lg shadow-sm">
            <span className="text-sm font-bold uppercase tracking-wide">Grand Total</span>
            <span className="text-xl font-bold">{formatCurrency(order.totalAmount)}</span>
          </div>

          {order.dueAmount > 0 && (
            <div className="flex justify-between items-center text-xs text-slate-500 font-medium px-1">
              <span>Balance Due</span>
              <span>{formatCurrency(order.dueAmount)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="mt-20 pt-10 border-t border-slate-100 text-center">
        <p className="text-sm font-bold text-slate-800 mb-1">Thank you for your business!</p>
        <p className="text-xs text-slate-400">Please check the items at the time of delivery. Report any discrepancies within 24 hours.</p>
        <p className="mt-8 text-[10px] text-slate-400 italic">
          This is a computer generated receipt, signature is not required.
        </p>
      </div>
    </div>
  )
}
