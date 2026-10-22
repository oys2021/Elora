import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import {
  categoryListResponseSchema,
  categoryResponseSchema,
  type CategoryFormValues,
} from '../schemas/category'

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const json = await apiClient.get('/categories?limit=100')
      return categoryListResponseSchema.parse(json)
    },
    select: (parsed) => parsed.data,
  })
}

export function useCreateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: CategoryFormValues) => {
      const json = await apiClient.post('/categories', values)
      return categoryResponseSchema.parse(json).data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: CategoryFormValues }) => {
      const json = await apiClient.put(`/categories/${id}`, values)
      return categoryResponseSchema.parse(json).data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/categories/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  })
}
