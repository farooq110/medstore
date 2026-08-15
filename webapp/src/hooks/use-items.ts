import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { itemService } from "../services/item.service"
import { Item } from "../types"
import { errorMessage, successMessage } from "../lib/notifications";

export function useItems(params?: { search?: string; category?: string; categoryIds?: string[]; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["items", params],
    queryFn: () => itemService.getItems(params),
  })
}

export function useItem(id: string) {
  return useQuery({
    queryKey: ["items", id],
    queryFn: async () => {
      const response = await itemService.getItemById(id)
      return response.data
    },
    enabled: !!id,
  })
}

export function useLowStockItems() {
  return useQuery({
    queryKey: ["items", "low-stock"],
    queryFn: async () => {
      const response = await itemService.getLowStockItems()
      return response.data
    },
  })
}

export function useExpiringSoonItems() {
  return useQuery({
    queryKey: ["items", "expiring-soon"],
    queryFn: async () => {
      const response = await itemService.getExpiringSoonItems()
      return response.data
    },
  })
}

export function useCreateItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Item>) => itemService.createItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] })
    },
  })
}

export function useUpdateItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Item> }) =>
      itemService.updateItem(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["items"] })
      queryClient.invalidateQueries({ queryKey: ["items", variables.id] })
    },
  })
}

export function useDeleteItem() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => itemService.deleteItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] })
      successMessage("Item deleted successfully")
    },
    onError: () => {
      errorMessage("Failed to delete item")
    }
  })
}
