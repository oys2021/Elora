import { z } from 'zod'

export const commentSchema = z.object({
  id: z.string(),
  productId: z.string(),
  userId: z.string(),
  body: z.string(),
  User: z.object({ id: z.string(), name: z.string(), avatar: z.string().nullable().optional() }).optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})
export type Comment = z.infer<typeof commentSchema>

export const commentListResponseSchema = z.object({
  data: z.array(commentSchema),
  meta: z
    .object({ total: z.number(), page: z.number(), totalPages: z.number() })
    .optional(),
})

export const commentResponseSchema = z.object({ data: commentSchema })

// Mirrors comment.service.js: body is required.
export const commentFormSchema = z.object({
  body: z.string({ error: 'Comment is required' }).trim().min(1, 'Comment is required'),
})
export type CommentFormValues = z.infer<typeof commentFormSchema>
