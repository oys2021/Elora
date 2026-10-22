import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import {
  productListResponseSchema,
  productResponseSchema,
  type ProductFormValues,
} from '../schemas/product'

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const json = await apiClient.get('/products?limit=100')
      return productListResponseSchema.parse(json)
    },
    select: (parsed) => parsed.data,
  })
}

export function useProduct(slug: string | undefined) {
  return useQuery({
    queryKey: ['products', 'slug', slug],
    queryFn: async () => {
      const json = await apiClient.get(`/products/${slug}`)
      return productResponseSchema.parse(json).data
    },
    enabled: !!slug,
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const json = await apiClient.post('/products', values)
      return productResponseSchema.parse(json).data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: ProductFormValues }) => {
      const json = await apiClient.put(`/products/${id}`, values)
      return productResponseSchema.parse(json).data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => apiClient.delete(`/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}
