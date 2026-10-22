import { z } from 'zod'

export const orderStatusValues = ['PENDING', 'PAID', 'CANCELLED', 'REFUNDED'] as const
export type OrderStatus = (typeof orderStatusValues)[number]

export const zohoSyncStatusValues = ['PENDING', 'PROCESSING', 'SYNCED', 'FAILED'] as const
export type ZohoSyncStatus = (typeof zohoSyncStatusValues)[number]

export const orderStatusColors: Record<OrderStatus, string> = {
  PENDING: 'blue',
  PAID: 'green',
  CANCELLED: 'red',
  REFUNDED: 'purple',
}

export const zohoSyncStatusColors: Record<ZohoSyncStatus, string> = {
  PENDING: 'default',
  PROCESSING: 'gold',
  SYNCED: 'green',
  FAILED: 'red',
}

export const fulfillmentMethodValues = ['PICKUP', 'DELIVERY'] as const
export type FulfillmentMethod = (typeof fulfillmentMethodValues)[number]

// Dummy payment only for now: CASH is settled in person and stays PENDING;
// the mobile money options are simulated as an instant success (PAID). See
// backend/src/services/dummyPayment.service.js.
export const paymentMethodValues = ['CASH', 'MTN', 'TELECEL', 'AIRTELTIGO'] as const
export type PaymentMethod = (typeof paymentMethodValues)[number]

const orderItemVariantSchema = z.object({
  id: z.string(),
  sku: z.string(),
  lengthOption: z.string().nullable().optional(),
  densityOption: z.string().nullable().optional(),
  colorOption: z.string().nullable().optional(),
  Product: z.object({ id: z.string(), name: z.string() }).optional(),
})

export const orderItemSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  variantId: z.string(),
  quantity: z.coerce.number().int(),
  unitPrice: z.coerce.number(),
  ProductVariant: orderItemVariantSchema.optional(),
})
export type OrderItem = z.infer<typeof orderItemSchema>

// basePrice/price/totalAmount come back as strings from Sequelize (DECIMAL
// serializes as text), so we coerce them to numbers for use on the frontend.
export const orderSchema = z.object({
  id: z.string(),
  userId: z.string().nullable().optional(),
  customerName: z.string(),
  customerEmail: z.string(),
  customerPhone: z.string(),
  totalAmount: z.coerce.number(),
  status: z.enum(orderStatusValues),
  zohoSyncStatus: z.enum(zohoSyncStatusValues),
  zohoSalesOrderId: z.string().nullable().optional(),
  syncAttempts: z.coerce.number().int().optional(),
  syncErrorMessage: z.string().nullable().optional(),
  lastSyncedAt: z.string().nullable().optional(),
  // .catch(): tolerate a server that predates these fields (or sends an
  // unrecognised value) rather than failing to parse the whole order — the
  // order itself was still created successfully.
  fulfillmentMethod: z.enum(fulfillmentMethodValues).catch('PICKUP'),
  deliveryAddress: z.string().nullable().optional(),
  deliveryCity: z.string().nullable().optional(),
  paymentMethod: z.enum(paymentMethodValues).catch('CASH'),
  paymentReference: z.string().nullable().optional(),
  OrderItems: z.array(orderItemSchema).default([]),
  User: z.object({ id: z.string(), name: z.string(), email: z.string() }).nullable().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
})
export type Order = z.infer<typeof orderSchema>

export const orderListResponseSchema = z.object({
  data: z.array(orderSchema),
  meta: z
    .object({ total: z.number(), page: z.number(), totalPages: z.number() })
    .optional(),
})

export const orderResponseSchema = z.object({ data: orderSchema })

// Mirrors order.service.js's updateOrder: only status, zohoSyncStatus,
// zohoSalesOrderId, syncErrorMessage and lastSyncedAt can be changed after creation.
export const orderStatusFormSchema = z.object({
  status: z.enum(orderStatusValues),
})
export type OrderStatusFormValues = z.infer<typeof orderStatusFormSchema>

// Mirrors the checkout payload order.controller.js accepts (POST /orders).
export const createOrderSchema = z
  .object({
    customerName: z.string({ error: 'Name is required' }).trim().min(1, 'Name is required'),
    customerEmail: z.string({ error: 'Email is required' }).trim().pipe(z.email('Enter a valid email address')),
    customerPhone: z.string({ error: 'Phone number is required' }).trim().min(6, 'Enter a valid phone number'),
    items: z
      .array(z.object({ variantId: z.string(), quantity: z.number().int().positive() }))
      .min(1, 'Your cart is empty'),
    fulfillmentMethod: z.enum(fulfillmentMethodValues),
    deliveryAddress: z.string().trim().optional(),
    deliveryCity: z.string().trim().optional(),
    paymentMethod: z.enum(paymentMethodValues),
  })
  .refine((v) => v.fulfillmentMethod !== 'DELIVERY' || !!v.deliveryAddress, {
    path: ['deliveryAddress'],
    message: 'Delivery address is required',
  })
  .refine((v) => v.fulfillmentMethod !== 'DELIVERY' || !!v.deliveryCity, {
    path: ['deliveryCity'],
    message: 'City is required',
  })
export type CreateOrderValues = z.infer<typeof createOrderSchema>
