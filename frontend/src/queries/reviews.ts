import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import { reviewListResponseSchema, reviewResponseSchema, type ReviewFormValues } from '../schemas/review'

export function useReviews(productId: string | undefined) {
  return useQuery({
    queryKey: ['products', productId, 'reviews'],
    queryFn: async () => {
      const json = await apiClient.get(`/products/${productId}/reviews?limit=50`)
      return reviewListResponseSchema.parse(json)
    },
    select: (parsed) => ({
      reviews: parsed.data,
      averageRating: parsed.meta?.averageRating ?? 0,
      reviewCount: parsed.meta?.reviewCount ?? parsed.data.length,
    }),
    enabled: !!productId,
  })
}

export function useCreateReview(productId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: ReviewFormValues) => {
      const json = await apiClient.post(`/products/${productId}/reviews`, values)
      return reviewResponseSchema.parse(json).data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products', productId, 'reviews'] }),
  })
}

export function useUpdateReview(productId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: ReviewFormValues }) => {
      const json = await apiClient.put(`/reviews/${id}`, values)
      return reviewResponseSchema.parse(json).data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products', productId, 'reviews'] }),
  })
}

export function useDeleteReview(productId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/reviews/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products', productId, 'reviews'] }),
  })
}
