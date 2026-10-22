import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import { favoriteListResponseSchema, favoriteResponseSchema } from '../schemas/favorite'

export function useFavorites(options: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ['favorites'],
    queryFn: async () => {
      const json = await apiClient.get('/favorites')
      return favoriteListResponseSchema.parse(json)
    },
    select: (parsed) => parsed.data,
    enabled: options.enabled ?? true,
  })
}

export function useAddFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (productId: string) => {
      const json = await apiClient.post(`/products/${productId}/favorites`, {})
      return favoriteResponseSchema.parse(json).data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  })
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (productId: string) => apiClient.delete(`/products/${productId}/favorites`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['favorites'] }),
  })
}
