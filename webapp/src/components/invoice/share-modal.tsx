import { useState } from "react"
import { Order, Client, Business } from "../../types"
import { Modal } from "../ui/modal"
import { Button } from "../ui/button"
import { Mail, MessageCircle, Copy, Check, Send, ExternalLink, Loader2 } from "lucide-react"
import { successMessage, errorMessage } from "../../lib/notifications"
import { apiClient } from "../../lib/api-client"
import { useAuth } from "@/src/hooks/use-auth"

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  order: Order
}

export function ShareModal({ isOpen, onClose, order }: ShareModalProps) {
  const [isCopying, setIsCopying] = useState(false)
  const [isSendingEmail, setIsSendingEmail] = useState(false)
  const { user } = useAuth()
  
  const client = typeof order.client === "object" ? (order.client as Client) : null
  const clientEmail = client?.email || ""
  const clientPhone = client?.phone || ""
  
  const shareToken = order.shareToken || ""
  const shareUrl = `${window.location.origin}/public/invoice/${order._id}/${shareToken}`
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl)
    setIsCopying(true)
    successMessage("Link Copied", "Invoice link copied to clipboard")
    setTimeout(() => setIsCopying(false), 2000)
  }
  
  const handleWhatsApp = () => {
    const businessName = (user?.business as Business).name || "Invoice Desk"
    const message = `Hello ${client?.name || ""}, here is your invoice #${order.orderNumber} from ${businessName}. Amount: PKR ${order.totalAmount}.\n\nView it here: ${shareUrl}`
    const encodedMessage = encodeURIComponent(message)
    
    // Clean phone number: remove all non-digits
    let cleanedPhone = clientPhone.replace(/\D/g, "")
    
    // Basic international format logic (adjusting for Pakistan local format if detected)
    if (cleanedPhone.startsWith("0") && cleanedPhone.length === 11) {
      cleanedPhone = "92" + cleanedPhone.substring(1)
    } else if (cleanedPhone.length === 10 && !cleanedPhone.startsWith("92")) {
      cleanedPhone = "92" + cleanedPhone
    }
    
    // Detect mobile to use wa.me vs web.whatsapp.com directly (helps avoid redirect issues)
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)
    const whatsappUrl = isMobile 
      ? `https://wa.me/${cleanedPhone}?text=${encodedMessage}`
      : `https://web.whatsapp.com/send?phone=${cleanedPhone}&text=${encodedMessage}`
      
    window.open(whatsappUrl, "_blank")
    onClose()
  }
  
  const handleEmail = async () => {
    if (!clientEmail) {
      errorMessage("Missing Email", "No email address found for this client.")
      return
    }
    
    setIsSendingEmail(true)
    try {
      await apiClient.post(`/orders/${order._id}/share/email`, { email: clientEmail })
      successMessage("Email Sent", `Invoice successfully sent to ${clientEmail}`)
      onClose()
    } catch (error: any) {
      errorMessage("Failed to Send", error.response?.data?.message || "Something went wrong")
    } finally {
      setIsSendingEmail(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Invoice">
      <div className="space-y-6 pt-2">
        <p className="text-sm text-slate-500">
          Share invoice <strong>#{order.orderNumber}</strong> with your client using the options below.
        </p>

        <div className="grid gap-3">
          {/* WhatsApp Option */}
          <button
            onClick={handleWhatsApp}
            disabled={!clientPhone}
            className="flex items-center justify-between rounded-xl border border-emerald-100 bg-emerald-50/50 p-4 text-left transition-all hover:bg-emerald-50 active:scale-[0.98] disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-slate-900">Send via WhatsApp</p>
                <p className="text-xs text-slate-500 italic">{clientPhone || "No phone number available"}</p>
              </div>
            </div>
            <ExternalLink className="h-4 w-4 text-emerald-500" />
          </button>

          {/* Email Option */}
          <button
            onClick={handleEmail}
            disabled={isSendingEmail || !clientEmail}
            className="flex items-center justify-between rounded-xl border border-blue-100 bg-blue-50/50 p-4 text-left transition-all hover:bg-blue-50 active:scale-[0.98] disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white">
                {isSendingEmail ? <Loader2 className="h-5 w-5 animate-spin" /> : <Mail className="h-5 w-5" />}
              </div>
              <div>
                <p className="font-semibold text-slate-900">Email to Client</p>
                <p className="text-xs text-slate-500 italic">{clientEmail || "No email address available"}</p>
              </div>
            </div>
            <Send className="h-4 w-4 text-blue-600" />
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Direct Share Link</label>
          <div className="flex gap-2">
            <div className="flex-1 truncate rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              {shareUrl}
            </div>
            <Button variant="outline" size="icon" onClick={handleCopyLink} className="shrink-0 bg-white">
              {isCopying ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin { animation: spin 1s linear infinite; }
      `}} />
    </Modal>
  )
}
