import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import { reviewListResponseSchema, reviewResponseSchema, type ReviewFormValues } from '../schemas/review'

export const REVIEWS_PAGE_SIZE = 5

// Just the rating summary (average, count, per-star counts) — what product
// cards and the purchase panel need. Asks for a single review, so it stays
// cheap however many reviews a product has.
export function useReviews(productId: string | undefined) {
  return useQuery({
    queryKey: ['products', productId, 'reviews', 'summary'],
    queryFn: async () => {
      const json = await apiClient.get(`/products/${productId}/reviews?limit=1`)
      return reviewListResponseSchema.parse(json)
    },
    select: (parsed) => ({
      averageRating: parsed.meta?.averageRating ?? 0,
      reviewCount: parsed.meta?.reviewCount ?? parsed.data.length,
      ratingBreakdown: parsed.meta?.ratingBreakdown ?? {},
    }),
    enabled: !!productId,
  })
}

// The review list itself, a page at a time ("Show more reviews").
export function useReviewPages(productId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ['products', productId, 'reviews', 'list'],
    queryFn: async ({ pageParam }) => {
      const json = await apiClient.get(`/products/${productId}/reviews?page=${pageParam}&limit=${REVIEWS_PAGE_SIZE}`)
      return reviewListResponseSchema.parse(json)
    },
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta && last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
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
