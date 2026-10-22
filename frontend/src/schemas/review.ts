import { z } from 'zod'

export const reviewSchema = z.object({
  id: z.string(),
  productId: z.string(),
  userId: z.string(),
  rating: z.coerce.number().int(),
  comment: z.string().nullable().optional(),
  User: z.object({ id: z.string(), name: z.string(), avatar: z.string().nullable().optional() }).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})
export type Review = z.infer<typeof reviewSchema>

export const reviewListResponseSchema = z.object({
  data: z.array(reviewSchema),
  meta: z
    .object({
      total: z.number(),
      page: z.number(),
      totalPages: z.number(),
      averageRating: z.number(),
      reviewCount: z.number(),
    })
    .optional(),
})

export const reviewResponseSchema = z.object({ data: reviewSchema })

// Mirrors review.service.js: rating is required and must be 1-5, comment is optional.
export const reviewFormSchema = z.object({
  rating: z
    .number({ error: 'Please pick a rating' })
    .int('Rating must be a whole number')
    .min(1, 'Please pick a rating')
    .max(5, 'Rating must be between 1 and 5'),
  comment: z.string().trim().optional(),
})
export type ReviewFormValues = z.infer<typeof reviewFormSchema>
