import { z } from 'zod'

export const deliveryModeValues = ['DOOR_TO_DOOR', 'OFFICE_PICKUP'] as const
export type DeliveryMode = (typeof deliveryModeValues)[number]

export const deliveryModeLabels: Record<DeliveryMode, string> = {
  DOOR_TO_DOOR: 'Door to Door',
  OFFICE_PICKUP: 'Office Pickup',
}

// price fields come back as strings from Sequelize (DECIMAL serializes as text).
export const deliveryZoneSchema = z.object({
  id: z.string(),
  location: z.string(),
  firstKgPrice: z.coerce.number(),
  extraKgPrice: z.coerce.number(),
  deliveryDuration: z.string(),
  deliveryMode: z.enum(deliveryModeValues),
  sortOrder: z.coerce.number(),
  isActive: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})
export type DeliveryZone = z.infer<typeof deliveryZoneSchema>

export const deliveryZoneListResponseSchema = z.object({ data: z.array(deliveryZoneSchema) })
export const deliveryZoneResponseSchema = z.object({ data: deliveryZoneSchema })

// Mirrors deliveryZone.controller.js's createSchema.
export const deliveryZoneFormSchema = z.object({
  location: z.string({ error: 'Location is required' }).trim().min(1, 'Location is required'),
  firstKgPrice: z.coerce
    .number({ error: 'Price must be a number' })
    .min(0, 'Price cannot be negative'),
  extraKgPrice: z.coerce
    .number({ error: 'Price must be a number' })
    .min(0, 'Price cannot be negative')
    .default(0),
  deliveryDuration: z
    .string({ error: 'Delivery duration is required' })
    .trim()
    .min(1, 'Delivery duration is required'),
  deliveryMode: z.enum(deliveryModeValues).default('DOOR_TO_DOOR'),
})
export type DeliveryZoneFormValues = z.infer<typeof deliveryZoneFormSchema>
