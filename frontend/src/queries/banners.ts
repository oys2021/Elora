import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import { bannerListResponseSchema, bannerResponseSchema } from '../schemas/banner'

// all: true also returns hidden banners (admin page). The storefront gets active ones only.
export function useBanners({ all = false }: { all?: boolean } = {}) {
  return useQuery({
    queryKey: ['banners', { all }],
    queryFn: async () => {
      const json = await apiClient.get(`/banners${all ? '?all=true' : ''}`)
      return bannerListResponseSchema.parse(json)
    },
    select: (parsed) => parsed.data,
  })
}

export function useCreateBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: { imageUrl: string; linkUrl?: string }) => {
      const json = await apiClient.post('/banners', values)
      return bannerResponseSchema.parse(json).data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['banners'] }),
  })
}

export function useUpdateBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id: string
      values: { imageUrl?: string; linkUrl?: string; isActive?: boolean }
    }) => {
      const json = await apiClient.put(`/banners/${id}`, values)
      return bannerResponseSchema.parse(json).data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['banners'] }),
  })
}

export function useReorderBanners() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const json = await apiClient.put('/banners/reorder', { ids })
      return bannerListResponseSchema.parse(json).data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['banners'] }),
  })
}

export function useDeleteBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/banners/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['banners'] }),
  })
}
