import { lazy, Suspense, useState } from "react"
import { Download } from "lucide-react"
import { Button } from "../components/ui/button"
import { ReportSkeleton } from "../components/report/report-skeleton"

const OutstandingDues = lazy(() => import("../components/report/outstanding-dues"))
const Collections = lazy(() => import("../components/report/collections"))
const Expiry = lazy(() => import("../components/report/expiry"))
const Stock = lazy(() => import("../components/report/stock"))
const Revenue = lazy(() => import("../components/report/revenue"))

const TABS = [
  { id: "dues", label: "Outstanding Dues" },
  { id: "collections", label: "Daily Collection" },
  { id: "expiry", label: "Expiry Report" },
  { id: "stock", label: "Stock Report" },
  { id: "revenue", label: "Revenue" },
]

export function Reports() {
  const [activeTab, setActiveTab] = useState<"revenue" | "dues" | "collections" | "expiry" | "stock">("dues")
  const isLoading = false

  if (isLoading) {
    return <ReportSkeleton />
  }

  const renderContent = () => {
    switch (activeTab) {
      case "revenue": return <Revenue />
      case "dues": return <OutstandingDues />
      case "collections": return <Collections />
      case "expiry": return <Expiry />
      case "stock": return <Stock />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
        <Button variant="outline" onClick={() => window.print()}>
          <Download className="mr-2 h-4 w-4" /> Print / PDF
        </Button>
      </div>

      <div className="flex overflow-x-auto border-b border-gray-200 dark:border-gray-800">
        {TABS.map(tab => (
          <Button
            key={tab.id}
            variant="ghost"
            onClick={() => setActiveTab(tab.id as any)}
            className={`rounded-none border-b-2 px-6 py-3 h-auto ${activeTab === tab.id
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:border-muted/30 hover:text-foreground"
              }`}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      <Suspense fallback={<ReportSkeleton />}>
        {renderContent()}
      </Suspense>
    </div>
  )
}
