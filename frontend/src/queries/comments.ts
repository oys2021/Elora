import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import { commentListResponseSchema, commentResponseSchema, type CommentFormValues } from '../schemas/comment'

export function useComments(productId: string | undefined) {
  return useQuery({
    queryKey: ['products', productId, 'comments'],
    queryFn: async () => {
      const json = await apiClient.get(`/products/${productId}/comments?limit=50`)
      return commentListResponseSchema.parse(json)
    },
    select: (parsed) => parsed.data,
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
