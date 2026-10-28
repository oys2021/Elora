import { z } from 'zod'
import { deliveryZoneSchema } from './deliveryZone'

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

// CASH is settled in person. MOBILE_MONEY and CARD are paid online through
// Paystack and only become PAID once the backend has confirmed the money.
// MTN / TELECEL / AIRTELTIGO only appear on old orders from the dummy gateway.
export const paymentMethodValues = ['CASH', 'MOBILE_MONEY', 'CARD', 'MTN', 'TELECEL', 'AIRTELTIGO'] as const
export type PaymentMethod = (typeof paymentMethodValues)[number]

// Mobile money networks the customer picks at checkout.
export const momoProviderValues = ['MTN', 'TELECEL', 'AIRTELTIGO'] as const
export type MomoProvider = (typeof momoProviderValues)[number]
export const momoProviderLabels: Record<MomoProvider, string> = {
  MTN: 'MTN',
  TELECEL: 'Telecel',
  AIRTELTIGO: 'AirtelTigo',
}

// What the checkout page does after creating an online order:
// go to Paystack's page (card), or wait for the phone prompt (mobile money).
export const paymentActionSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('redirect'), url: z.string() }),
  z.object({ type: z.literal('momo'), status: z.string(), displayText: z.string().nullable() }),
])
export type PaymentAction = z.infer<typeof paymentActionSchema>

// What checkout can send today.
export const checkoutPaymentMethodValues = ['CASH', 'MOBILE_MONEY', 'CARD'] as const
export type CheckoutPaymentMethod = (typeof checkoutPaymentMethodValues)[number]

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  MOBILE_MONEY: 'Mobile Money',
  CARD: 'Card',
  MTN: 'MTN Mobile Money',
  TELECEL: 'Telecel Cash',
  AIRTELTIGO: 'AirtelTigo Money',
}

const orderItemVariantSchema = z.object({
  id: z.string(),
  sku: z.string(),
  lengthOption: z.string().nullable().optional(),
  densityOption: z.string().nullable().optional(),
  colorOption: z.string().nullable().optional(),
  Product: z.object({ id: z.string(), name: z.string(), imageUrls: z.array(z.string()).default([]) }).optional(),
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
  deliveryZoneId: z.string().nullable().optional(),
  deliveryFee: z.coerce.number().catch(0),
  DeliveryZone: deliveryZoneSchema.nullable().optional(),
  paymentMethod: z.enum(paymentMethodValues).catch('CASH'),
  paymentReference: z.string().nullable().optional(),
  paymentProvider: z.string().nullable().optional(),
  // Paystack checkout page; set while an online order is waiting to be paid.
  paymentAuthorizationUrl: z.string().nullable().optional(),
  paymentChannel: z.string().nullable().optional(),
  paidAt: z.string().nullable().optional(),
  // Set when a payment arrived but needs an admin's attention.
  paymentReviewReason: z.string().nullable().optional(),
  // Only on the response to placing an order.
  paymentAction: paymentActionSchema.nullable().optional(),
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
    deliveryZoneId: z.string().trim().optional(),
    paymentMethod: z.enum(checkoutPaymentMethodValues),
    momoProvider: z.enum(momoProviderValues).optional(),
    momoPhone: z.string().trim().optional(),
    // One per checkout attempt: resending the same request returns the same
    // order instead of creating (and charging for) a second one.
    idempotencyKey: z.string().optional(),
  })
  .refine((v) => v.fulfillmentMethod !== 'DELIVERY' || !!v.deliveryAddress, {
    path: ['deliveryAddress'],
    message: 'Delivery address is required',
  })
  .refine((v) => v.fulfillmentMethod !== 'DELIVERY' || !!v.deliveryZoneId, {
    path: ['deliveryZoneId'],
    message: 'Please choose a delivery location',
  })
export type CreateOrderValues = z.infer<typeof createOrderSchema>

// Mirrors payment.controller.js's verify response (POST /payments/paystack/verify).
export const paymentResultSchema = z.object({
  orderId: z.string(),
  status: z.enum(orderStatusValues),
  // Paystack's own status: 'success', 'abandoned', 'failed', 'ongoing', ...
  // or 'unknown' if Paystack couldn't be reached just now.
  paystackStatus: z.string(),
  // The customer may still be approving it (e.g. an unanswered MoMo prompt).
  inProgress: z.boolean(),
  totalAmount: z.coerce.number(),
  fulfillmentMethod: z.enum(fulfillmentMethodValues).catch('PICKUP'),
  paymentMethod: z.enum(paymentMethodValues).catch('MOBILE_MONEY'),
  paymentReference: z.string().nullable(),
  paymentAuthorizationUrl: z.string().nullable(),
  // Only from submit-otp: the network's reply to the code, e.g. 'send_otp' again.
  chargeStatus: z.string().optional(),
  displayText: z.string().nullable().optional(),
})
export type PaymentResult = z.infer<typeof paymentResultSchema>
export const paymentResultResponseSchema = z.object({ data: paymentResultSchema })
