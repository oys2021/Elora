import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import {
  orderListResponseSchema,
  orderResponseSchema,
  type OrderStatusFormValues,
  type CreateOrderValues,
} from '../schemas/order'

interface OrdersFilter {
  status?: string
  userId?: string
  page?: number
  limit?: number
  enabled?: boolean
}

export function useOrders(filter: OrdersFilter = {}) {
  const { status, userId, page = 1, limit = 100, enabled = true } = filter

  return useQuery({
    queryKey: ['orders', { status, userId, page, limit }],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) })
      if (status) params.set('status', status)
      if (userId) params.set('userId', userId)
      const json = await apiClient.get(`/orders?${params.toString()}`)
      return orderListResponseSchema.parse(json)
    },
    select: (parsed) => ({ orders: parsed.data, meta: parsed.meta }),
    enabled,
  })
}

export function useOrder(id: string | undefined) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const json = await apiClient.get(`/orders/${id}`)
      return orderResponseSchema.parse(json).data
    },
    enabled: !!id,
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: CreateOrderValues) => {
      const json = await apiClient.post('/orders', values)
      return orderResponseSchema.parse(json).data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] })
      // Stock just changed, so product/variant lists (out-of-stock badges, "left in
      // stock" counts) need to be refetched.
      queryClient.invalidateQueries({ queryKey: ['products'] })
    },
  })
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: OrderStatusFormValues }) => {
      const json = await apiClient.put(`/orders/${id}`, values)
      return orderResponseSchema.parse(json).data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}

export function useRetryOrderSync() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const json = await apiClient.put(`/orders/${id}/sync`, {})
      return orderResponseSchema.parse(json).data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['orders'] }),
  })
}
