import { z } from 'zod'

export const bannerSchema = z.object({
  id: z.string(),
  imageUrl: z.string(),
  linkUrl: z.string().nullable().optional(),
  sortOrder: z.coerce.number(),
  isActive: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})
export type Banner = z.infer<typeof bannerSchema>

export const bannerListResponseSchema = z.object({ data: z.array(bannerSchema) })
export const bannerResponseSchema = z.object({ data: bannerSchema })

// Mirrors the link rule in backend/src/controllers/banner.controller.js:
// empty, a page on this site ("/products"), or a full http(s) address.
export const BANNER_LINK_MESSAGE = 'Use a page on this site like /products, or a full https:// address'
export function isValidBannerLink(value: string): boolean {
  const v = value.trim()
  return v === '' || /^\/(?!\/)\S*$/.test(v) || /^https?:\/\/\S+$/i.test(v)
}
