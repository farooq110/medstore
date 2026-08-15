import { useQuery } from "@tanstack/react-query"
import { reportService } from "../services/report.service"

export function useOutstandingDues(params: { page: number; limit: number }) {
  return useQuery({
    queryKey: ["reports", "outstanding-dues", params],
    queryFn: async () => {
      const response = await reportService.getOutstandingDues(params)
      return response.data
    },
  })
}

export function useCollectionsReport(params: { startDate: string; endDate: string; page: number; limit: number }) {
  return useQuery({
    queryKey: ["reports", "collections", params],
    queryFn: async () => {
      const response = await reportService.getCollections(params)
      return response.data
    },
    enabled: !!params.startDate && !!params.endDate,
  })
}

export function useSalesPersonReport() {
  return useQuery({
    queryKey: ["reports", "sales-person"],
    queryFn: async () => {
      const response = await reportService.getSalesPersonReport()
      return response.data
    },
  })
}

export function useExpiryReport(params: { status: "all" | "expired" | "expiring_soon"; page: number; limit: number }) {
  return useQuery({
    queryKey: ["reports", "expiry", params],
    queryFn: async () => {
      const response = await reportService.getExpiryReport(params)
      return response.data
    },
  })
}

export function useStockReport(params: { filter: "all" | "low_stock" | "out_of_stock"; page: number; limit: number }) {
  return useQuery({
    queryKey: ["reports", "stock", params],
    queryFn: async () => {
      const response = await reportService.getStockReport(params)
      return response.data
    },
  })
}

export function useRevenueReport(params: { year: number; month: number | "ALL" }) {
  return useQuery({
    queryKey: ["reports", "revenue", params],
    queryFn: async () => {
      const response = await reportService.getRevenueReport(params)
      return response.data
    },
  })
}
