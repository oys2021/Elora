import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import {
  deliveryZoneListResponseSchema,
  deliveryZoneResponseSchema,
  type DeliveryZoneFormValues,
} from '../schemas/deliveryZone'

// all: true also returns hidden zones (admin page). Checkout gets active ones only.
export function useDeliveryZones({ all = false }: { all?: boolean } = {}) {
  return useQuery({
    queryKey: ['delivery-zones', { all }],
    queryFn: async () => {
      const json = await apiClient.get(`/delivery-zones${all ? '?all=true' : ''}`)
      return deliveryZoneListResponseSchema.parse(json)
    },
    select: (parsed) => parsed.data,
  })
}

export function useCreateDeliveryZone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: DeliveryZoneFormValues) => {
      const json = await apiClient.post('/delivery-zones', values)
      return deliveryZoneResponseSchema.parse(json).data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['delivery-zones'] }),
  })
}

export function useUpdateDeliveryZone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string
      values: Partial<DeliveryZoneFormValues> & { isActive?: boolean }
    }) => {
      const json = await apiClient.put(`/delivery-zones/${id}`, values)
      return deliveryZoneResponseSchema.parse(json).data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['delivery-zones'] }),
  })
}

export function useDeleteDeliveryZone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/delivery-zones/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['delivery-zones'] }),
  })
}
