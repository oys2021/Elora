import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/client'

export type NotificationAudience = 'customer' | 'admin'

export const notificationSchema = z.object({
  id: z.string(),
  type: z.string(),
  title: z.string(),
  body: z.string().nullable(),
  link: z.string().nullable(),
  readAt: z.string().nullable(),
  createdAt: z.string(),
})
export type AppNotification = z.infer<typeof notificationSchema>

const query = (audience: NotificationAudience) => (audience === 'admin' ? '?audience=admin' : '')

// Cheap count, checked every 30s so the badge updates without a refresh.
export function useUnreadCount(audience: NotificationAudience, enabled: boolean) {
  return useQuery({
    queryKey: ['notifications', audience, 'unread'],
    queryFn: async () => {
      const json = await apiClient.get(`/notifications/unread-count${query(audience)}`)
      return z.object({ data: z.object({ count: z.number() }) }).parse(json).data.count
    },
    enabled,
    refetchInterval: 30_000,
  })
}

// The list itself is only fetched when the bell is opened.
export function useNotifications(audience: NotificationAudience, enabled: boolean) {
  return useQuery({
    queryKey: ['notifications', audience, 'list'],
    queryFn: async () => {
      const json = await apiClient.get(`/notifications${query(audience)}`)
      return z.object({ data: z.array(notificationSchema) }).parse(json).data
    },
    enabled,
  })
}

export function useMarkNotificationRead(audience: NotificationAudience) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.post(`/notifications/${id}/read${query(audience)}`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', audience] }),
  })
}

export function useMarkAllNotificationsRead(audience: NotificationAudience) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => apiClient.post(`/notifications/read-all${query(audience)}`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications', audience] }),
  })
}
