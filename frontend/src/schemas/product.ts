import { z } from 'zod'
import { categorySchema } from './category'

// basePrice comes back as a string from Sequelize (DECIMAL serializes as
// text), so we coerce it to a number for use on the frontend.
export const productSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  zohoItemId: z.string().nullable().optional(),
  name: z.string(),
  slug: z.string(),
  description: z.string(),
  basePrice: z.coerce.number(),
  imageUrls: z.array(z.string()).default([]),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  syncStatus: z.string().optional(),
  // Computed by the API from the product's variants.
  variantCount: z.coerce.number().default(0),
  totalStock: z.coerce.number().default(0),
  minPrice: z.coerce.number().nullish(),
  Category: categorySchema.optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})
export type Product = z.infer<typeof productSchema>

export const productListResponseSchema = z.object({
  data: z.array(productSchema),
  meta: z
    .object({ total: z.number(), page: z.number(), totalPages: z.number() })
    .optional(),
})

export const productResponseSchema = z.object({ data: productSchema })

// Mirrors product.service.js's required fields: categoryId, name,
// description, basePrice. slug is generated server-side from name, so the
// form never collects it.
export const productFormSchema = z.object({
  categoryId: z.string({ error: 'Category is required' }).min(1, 'Category is required'),
  name: z.string({ error: 'Name is required' }).trim().min(1, 'Name is required'),
  description: z.string({ error: 'Description is required' }).trim().min(1, 'Description is required'),
  basePrice: z.coerce
    .number({ error: 'Price must be a number' })
    .positive('Price must be greater than 0'),
  imageUrls: z.array(z.string().url('Must be a valid URL')).default([]),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
})
export type ProductFormValues = z.infer<typeof productFormSchema>
