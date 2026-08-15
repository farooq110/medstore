import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { clientService } from "../services/client.service"
import { Client } from "../types"

export function useClients(params?: { search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["clients", params],
    queryFn: () => clientService.getClients(params),
  })
}

export function useClient(id: string) {
  return useQuery({
    queryKey: ["clients", id],
    queryFn: async () => {
      const response = await clientService.getClientById(id)
      return response.data
    },
    enabled: !!id,
  })
}

export function useClientDues(id: string) {
  return useQuery({
    queryKey: ["clients", id, "dues"],
    queryFn: async () => {
      const response = await clientService.getClientDues(id)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<Client>) => clientService.createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] })
    },
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Client> }) =>
      clientService.updateClient(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["clients"] })
      queryClient.invalidateQueries({ queryKey: ["clients", variables.id] })
    },
  })
}

export function useClientDetail(id: string) {
  return useQuery({
    queryKey: ["clients", id, "detail"],
    queryFn: async () => {
      const response = await clientService.getClientDetail(id)
      return response.data
    },
    enabled: !!id,
  })
}

