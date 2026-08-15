import { useState, useCallback } from "react"

interface UsePaginationOptions {
  initialPage?: number
  initialLimit?: number
}

export function usePagination(options: UsePaginationOptions = {}) {
  const [page, setPage] = useState(options.initialPage || 1)
  const [limit, setLimit] = useState(options.initialLimit || 10)

  const nextPage = useCallback(() => {
    setPage((prev) => prev + 1)
  }, [])

  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1))
  }, [])

  const gotoPage = useCallback((pageNumber: number) => {
    setPage(pageNumber)
  }, [])

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit)
    setPage(1) // Reset to first page when limit changes
  }, [])

  return {
    page,
    limit,
    setPage: gotoPage,
    setLimit: changeLimit,
    nextPage,
    prevPage,
  }
}
