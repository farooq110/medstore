import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { alertService } from "../services/alert.service"
import { useAuth } from "./use-auth"
import { USER_ROLES } from "../types"

export function useAlerts(resolved: boolean = false) {
  return useQuery({
    queryKey: ["alerts", { resolved }],
    queryFn: async () => {
      const response = await alertService.getAlerts(resolved)
      return response.data
    },
  })
}

export function useMarkAlertSeen() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => alertService.markAlertSeen(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] })
    },
  })
}

export function useResolveAlert() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => alertService.resolveAlert(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerts"] })
      queryClient.invalidateQueries({ queryKey: ["items"] })
    },
  })
}

export function useUnseenAlertsCount() {
  const { user } = useAuth()
  const { data: alerts } = useAlerts(false)
  if (!alerts || !user) return 0
  return alerts.filter(a => user.role === USER_ROLES.OWNER ? !a.seenByOwner : !a.seenBySalesPerson).length
}
