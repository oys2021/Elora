import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import { commentListResponseSchema, commentResponseSchema, type CommentFormValues } from '../schemas/comment'

export const COMMENTS_PAGE_SIZE = 5

// Newest first, a page at a time ("Show more comments").
export function useComments(productId: string | undefined) {
  return useInfiniteQuery({
    queryKey: ['products', productId, 'comments'],
    queryFn: async ({ pageParam }) => {
      const json = await apiClient.get(`/products/${productId}/comments?page=${pageParam}&limit=${COMMENTS_PAGE_SIZE}`)
      return commentListResponseSchema.parse(json)
    },
    initialPageParam: 1,
    getNextPageParam: (last) => (last.meta && last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined),
    enabled: !!productId,
  })
}

export function useCreateComment(productId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: CommentFormValues) => {
      const json = await apiClient.post(`/products/${productId}/comments`, values)
      return commentResponseSchema.parse(json).data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products', productId, 'comments'] }),
  })
}

export function useDeleteComment(productId: string | undefined) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/comments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products', productId, 'comments'] }),
  })
}
