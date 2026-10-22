import { z } from 'zod'

// What GET /users returns: the user plus activity computed by the API.
// The password hash is never sent, only `hasPassword`.
export const adminUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  username: z.string().nullable().optional(),
  email: z.string(),
  avatar: z.string().nullable().optional(),
  googleId: z.string().nullable().optional(),
  hasPassword: z.coerce.boolean().default(false),
  orderCount: z.coerce.number().default(0),
  totalSpent: z.coerce.number().default(0),
  lastOrderAt: z.string().nullable().optional(),
  lastLoginAt: z.string().nullable().optional(),
  createdAt: z.string().optional(),
})
export type AdminUser = z.infer<typeof adminUserSchema>

export const adminUserListResponseSchema = z.object({
  data: z.array(adminUserSchema),
  meta: z.object({ total: z.number(), page: z.number(), totalPages: z.number() }).optional(),
})
