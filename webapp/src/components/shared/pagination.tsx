import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../ui/button"
import { Pagination as PaginationType } from "../../types"

interface PaginationProps {
  pagination: PaginationType
  onPageChange: (page: number) => void
  currentCount: number
}

export function Pagination({ pagination, onPageChange, currentCount }: PaginationProps) {
  const { page, pages, totalCount, limit } = pagination

  const startRange = (page - 1) * limit + 1
  const endRange = startRange + currentCount - 1

  if (pages <= 1) return null

  const getPageNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5
    
    let start = Math.max(1, page - Math.floor(maxVisiblePages / 2))
    let end = Math.min(pages, start + maxVisiblePages - 1)
    
    if (end === pages) {
      start = Math.max(1, end - maxVisiblePages + 1)
    }

    for (let i = start; i <= end; i++) {
      pageNumbers.push(i)
    }
    return pageNumbers
  }

  return (
    <div className="flex flex-col items-center justify-between gap-4 rounded-xl border border-border bg-surface p-4 sm:flex-row">
      <div className="text-sm text-muted">
        Showing <span className="font-bold text-foreground">{totalCount === 0 ? 0 : startRange}</span> to{" "}
        <span className="font-bold text-foreground">{totalCount === 0 ? 0 : endRange}</span> of{" "}
        <span className="font-bold text-foreground">{totalCount}</span> records
      </div>
      
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getPageNumbers().map((n) => (
          <Button
            key={n}
            variant={page === n ? "primary" : "outline"}
            size="sm"
            onClick={() => onPageChange(n)}
            className="h-8 w-8 p-0 text-xs font-bold"
          >
            {n}
          </Button>
        ))}

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
