import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { userService } from "../services/user.service"
import { User } from "../types"
import { errorMessage, successMessage } from "../lib/notifications";

export function useUsers(params?: { search?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => userService.getUsers(params),
  })
}

export function useUser(id: string) {
  return useQuery({
    queryKey: ["users", id],
    queryFn: async () => {
      const response = await userService.getUserById(id)
      return response.data
    },
    enabled: !!id,
  })
}

export function useCreateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<User> & { password?: string }) => userService.createUser(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      successMessage("User Created Successfully", "User has been created and email has been sent to the user")
    },
    onError: (error: any) => {
      errorMessage("User Creation Failed", error.response.data.message)
    }
  })
}

export function useUpdateUser() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<User> }) =>
      userService.updateUser(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["users", variables.id] })
      queryClient.invalidateQueries({ queryKey: ["client-options"] })
      queryClient.invalidateQueries({ queryKey: ["clients"] })
    },
  })
}

export function useClientOptions(params?: { isAssigned?: string; page?: number; limit?: number }) {
  return useQuery({
    queryKey: ["client-options", params],
    queryFn: () => userService.getClientOptions(params),
  })
}

export function useAssignClients() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ salesPersonId, clientIds }: { salesPersonId: string; clientIds: string[] }) =>
      userService.assignClients(salesPersonId, clientIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["users", variables.salesPersonId] })
      queryClient.invalidateQueries({ queryKey: ["client-options"] })
    },
  })
}

export function useRemoveClient() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (clientId: string) => userService.removeClient(clientId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] })
      queryClient.invalidateQueries({ queryKey: ["client-options"] })
    },
  })
}
