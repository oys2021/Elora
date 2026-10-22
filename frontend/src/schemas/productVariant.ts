import { z } from 'zod'

export const productVariantSchema = z.object({
  id: z.string(),
  productId: z.string(),
  zohoVariantId: z.string().nullable().optional(),
  sku: z.string(),
  lengthOption: z.string().nullable().optional(),
  densityOption: z.string().nullable().optional(),
  colorOption: z.string().nullable().optional(),
  stockQuantity: z.coerce.number().int(),
  price: z.coerce.number(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})
export type ProductVariant = z.infer<typeof productVariantSchema>

export const productVariantListResponseSchema = z.object({
  data: z.array(productVariantSchema),
  meta: z
    .object({ total: z.number(), page: z.number(), totalPages: z.number() })
    .optional(),
})

export const productVariantResponseSchema = z.object({ data: productVariantSchema })

// Mirrors productVariant.service.js: price is required, stockQuantity cannot
// be negative. sku is generated server-side, so the form never collects it.
export const productVariantFormSchema = z.object({
  productId: z.string({ error: 'Product is required' }).min(1, 'Product is required'),
  price: z.coerce
    .number({ error: 'Price must be a number' })
    .positive('Price must be greater than 0'),
  lengthOption: z.string().trim().optional(),
  densityOption: z.string().trim().optional(),
  colorOption: z.string().trim().optional(),
  stockQuantity: z.coerce
    .number({ error: 'Stock must be a number' })
    .int('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .default(0),
})
export type ProductVariantFormValues = z.infer<typeof productVariantFormSchema>
