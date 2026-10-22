import { z } from 'zod'

// Matches what the backend actually returns (see Category model).
export const categorySchema = z.object({
  id: z.string(),
  name: z.string(),
  slug: z.string(),
  imageUrl: z.string().nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})
export type Category = z.infer<typeof categorySchema>

export const categoryListResponseSchema = z.object({
  data: z.array(categorySchema),
  meta: z
    .object({ total: z.number(), page: z.number(), totalPages: z.number() })
    .optional(),
})

export const categoryResponseSchema = z.object({ data: categorySchema })

// Client-side validation for the admin add/edit form, mirroring the
// backend's required fields in category.service.js. slug is generated
// server-side from name, so the form never collects it.
export const categoryFormSchema = z.object({
  name: z.string({ error: 'Name is required' }).trim().min(1, 'Name is required'),
  imageUrl: z.union([z.string().trim().url('Must be a valid URL'), z.literal('')]).optional(),
})
export type CategoryFormValues = z.infer<typeof categoryFormSchema>
