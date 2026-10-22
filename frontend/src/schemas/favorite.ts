import { z } from 'zod'
import { productSchema } from './product'

export const favoriteSchema = z.object({
  id: z.string(),
  userId: z.string(),
  productId: z.string(),
  Product: productSchema.optional(),
  createdAt: z.string().optional(),
})
export type Favorite = z.infer<typeof favoriteSchema>

export const favoriteListResponseSchema = z.object({
  data: z.array(favoriteSchema),
})

export const favoriteResponseSchema = z.object({ data: favoriteSchema })
