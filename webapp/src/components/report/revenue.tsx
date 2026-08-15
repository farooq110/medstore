import { useState } from "react"
import { useRevenueReport } from "@/src/hooks/use-reports"
import { DataTable } from "../ui/data-table"
import { StatCard } from "../ui/stat-card"
import { formatCurrency } from "@/src/lib/utils"
import { StatCardSkeleton } from "../ui/stat-card-skeleton"

const MONTH_NAMES = [
  "ALL",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

const Revenue = () => {
  const today = new Date()
  const currentYear = today.getFullYear()
  const currentMonth = today.getMonth() + 1

  const [selectedYear, setSelectedYear] = useState(currentYear)

  const [selectedMonth, setSelectedMonth] = useState<number | "ALL">("ALL")

  const { data: revenueData, isLoading: revenueLoading } = useRevenueReport({
    year: selectedYear,
    month: selectedMonth,
  })

  const summary = revenueData?.summary
  const monthly = revenueData?.monthly || []

  const startYear = summary?.joinYear || currentYear
  const years = []
  for (let y = currentYear; y >= startYear; y--) {
    years.push(y)
  }

  const tableData = selectedMonth === "ALL"
    ? monthly
    : monthly.filter((item: any) => item.month === selectedMonth)

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {revenueLoading ? (
          <>
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
            <StatCardSkeleton />
          </>
        ) : (
          <>
            <StatCard
              title={selectedMonth === "ALL" ? `Total Revenue (${selectedYear})` : `Revenue (${MONTH_NAMES[selectedMonth]} ${selectedYear})`}
              value={formatCurrency(summary?.totalRevenueForYear || 0)}
            />
            <StatCard
              title={selectedMonth === "ALL" ? `Total Profit (${selectedYear})` : `Profit (${MONTH_NAMES[selectedMonth]} ${selectedYear})`}
              value={formatCurrency(summary?.totalProfitForYear || 0)}
              description="Selling price minus cost price of all items sold"
            />
            <StatCard
              title={selectedMonth === "ALL" ? `Total Collected (${selectedYear})` : `Collected (${MONTH_NAMES[selectedMonth]} ${selectedYear})`}
              value={formatCurrency(summary?.totalCollectedForYear || 0)}
            />
            <StatCard
              title={selectedMonth === "ALL" ? `Total Orders (${selectedYear})` : `Orders (${MONTH_NAMES[selectedMonth]} ${selectedYear})`}
              value={summary?.totalOrdersForYear || 0}
            />
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-muted">Year</span>
          <select
            value={selectedYear}
            onChange={(e) => {
              const newYear = parseInt(e.target.value)
              setSelectedYear(newYear)
              setSelectedMonth("ALL")
            }}
            className="w-full sm:w-44 rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-muted">Month</span>
          <select
            value={selectedMonth}
            onChange={(e) => {
              const val = e.target.value
              setSelectedMonth(val === "ALL" ? "ALL" : parseInt(val))
            }}
            className="w-full sm:w-44 rounded-lg border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {MONTH_NAMES.map((name, index) => (
              <option key={name} value={name === "ALL" ? "ALL" : index}>
                {name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DataTable
        data={tableData}
        loading={revenueLoading}
        columns={[
          {
            header: "Month",
            accessor: (row: any) => MONTH_NAMES[row.month],
          },
          {
            header: "Revenue",
            accessor: (row: any) => (
              <span className="font-medium text-foreground dark:text-white">
                {formatCurrency(row.totalRevenue)}
              </span>
            ),
          },
          {
            header: "Orders",
            accessor: (row: any) => row.totalOrders,
          },
          {
            header: "Collected",
            accessor: (row: any) => (
              <span className="font-medium text-green-600 dark:text-green-400">
                {formatCurrency(row.totalCollected)}
              </span>
            ),
          },
          {
            header: "Outstanding",
            accessor: (row: any) => (
              <span className="font-medium text-red-600 dark:text-red-400">
                {formatCurrency(row.totalDue)}
              </span>
            ),
          },
        ]}
      />
    </div>
  )
}

export default Revenue