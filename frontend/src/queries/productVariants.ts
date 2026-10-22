import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '../api/client'
import {
  productVariantListResponseSchema,
  productVariantResponseSchema,
  type ProductVariantFormValues,
} from '../schemas/productVariant'

export function useProductVariants(productId: string | undefined) {
  return useQuery({
    queryKey: ['products', productId, 'variants'],
    queryFn: async () => {
      const json = await apiClient.get(`/products/${productId}/variants`)
      return productVariantListResponseSchema.parse(json)
    },
    select: (parsed) => parsed.data,
    enabled: !!productId,
  })
}

export function useCreateProductVariant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (values: ProductVariantFormValues) => {
      const json = await apiClient.post('/product-variants', values)
      return productVariantResponseSchema.parse(json).data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useUpdateProductVariant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, values }: { id: string; values: ProductVariantFormValues }) => {
      const json = await apiClient.put(`/product-variants/${id}`, values)
      return productVariantResponseSchema.parse(json).data
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}

export function useDeleteProductVariant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string; productId: string }) => apiClient.delete(`/product-variants/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  })
}
