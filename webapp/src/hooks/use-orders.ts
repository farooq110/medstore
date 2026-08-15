import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { orderService } from "../services/order.service"
import { OrderStatus, OrderType } from "../types"

interface OrderFilters {
  status?: OrderStatus
  clientIds?: string[]
  type?: OrderType
  search?: string
  page?: number
  limit?: number
}

export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ["orders", filters],
    queryFn: () => orderService.getOrders(filters),
  })
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: async () => {
      const response = await orderService.getOrderById(id)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => orderService.createOrder(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["items"] })
      queryClient.invalidateQueries({ queryKey: ["alerts"] })
    },
  })
}

export function useAssignOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { salesPersonId: string; assignFor: "delivery" | "payment_collection" } }) =>
      orderService.assignOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}

export function useMarkItemsProvided() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => orderService.markItemsProvided(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["orders", id] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}

export function useAddPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { amount: number; method: string; notes?: string } }) =>
      orderService.recordPayment(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["clients"] })
    },
  })
}

export function useMarkBackorderPurchased() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => orderService.markBackorderPurchased(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["orders", id] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })
}
