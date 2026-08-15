import { useEffect, useRef, useState } from "react"
import { useParams } from "react-router-dom"
import { publicService } from "../services/public.service"
import { Order, Business } from "../types"
import { PrintableInvoice } from "../components/invoice/printable-invoice"
import { Button } from "../components/ui/button"
import { Printer, Download, Loader2, AlertCircle } from "lucide-react"
import html2canvas from "html2canvas-pro"
import jsPDF from "jspdf"
import "../styles/public-invoice-styles.css"

export function PublicInvoice() {
  const { id, token } = useParams<{ id: string; token: string }>()
  const printRef = useRef<HTMLDivElement>(null)
  const [data, setData] = useState<{ order: Order; business: Business } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id && token) {
      publicService
        .getPublicOrder(id, token)
        .then((res) => {
          setData(res)
          setIsLoading(false)
        })
        .catch((err) => {
          setError(err.response?.data?.message || "Could not fetch the invoice")
          setIsLoading(false)
        })
    }
  }, [id, token])

  const handlePrint = () => {
    window.print()
  }

  const generatePDF = () => {
    const element = document.getElementById("printable-invoice")
    if (!element) return

    html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
      windowWidth: 1024,
      onclone: (clonedDoc) => {
        const clonedElement = clonedDoc.getElementById("printable-invoice")
        if (clonedElement) {
          // Forcing layout styles to simulate desktop view on cloned element because PDF content is rendered without any padding on sides
          clonedElement.style.display = "block"
          clonedElement.style.width = "850px"
          clonedElement.style.padding = "40px"
          clonedElement.style.margin = "0"
          clonedElement.classList.add("html2canvas-override")
        }
      },
    }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png")
      const pdf = new jsPDF("p", "mm", "a4")
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      const margin = 10
      const contentWidth = pdfWidth - (margin * 2)
      const aspectRatio = canvas.width / canvas.height
      const contentHeight = contentWidth / aspectRatio

      let position = margin
      pdf.addImage(imgData, "PNG", margin, position, contentWidth, contentHeight)
      pdf.save(`${business.name}-invoice-${order.orderNumber}.pdf`)
    })
  }

  if (isLoading) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-slate-500 font-medium">Loading your invoice...</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center text-slate-900">
        <div className="rounded-full bg-red-100 p-3">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="text-xl font-bold">Access Denied</h1>
        <p className="max-w-md text-slate-500">{error || "This invoice link is invalid or has expired."}</p>
      </div>
    )
  }

  const { order, business } = data

  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 md:py-12">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white bg-white/80 p-4 shadow-sm backdrop-blur-md print:hidden">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400">Invoice Viewer</h2>
            <p className="text-lg font-bold text-slate-800">Order #{order.orderNumber}</p>
          </div>
          <div className="flex gap-3">

            <Button variant="primary" onClick={handlePrint}>
              <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button variant="outline" onClick={generatePDF}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
          </div>
        </div>

        <div ref={printRef} className="overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 py-8 px-4">
          {/* We override the .hidden class specifically for this public view */}
          <div className="public-invoice-container">
            <PrintableInvoice
              order={order}
              client={typeof order.client === "object" ? order.client : null}
              businessInfo={{
                name: business.name,
                address: business.address || "",
                phone: (business.owner as any)?.phone,
                email: (business.owner as any)?.email,
                logo: business.logo
              }}
            />
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-slate-400 print:hidden">
          <p>Powered by Invoice Desk</p>
        </div>
      </div>
    </div>
  )
}
