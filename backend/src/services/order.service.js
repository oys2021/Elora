import { randomBytes } from 'node:crypto';
import { UniqueConstraintError } from 'sequelize';
import { sequelize, Order, OrderItem, ProductVariant, Product, User, DeliveryZone } from '../models/index.js';
import AppError from '../utils/AppError.js';
import logger from '../utils/logger.js';
import { deductStock } from './stock.service.js';
import {
  amountToCharge,
  chargeMobileMoney,
  initializeTransaction,
  isPaystackConfigured,
  momoTarget,
  PaystackError,
} from './paystack.service.js';
import { cancelUnpaidOrder, confirmPaystackPayment } from './payment.service.js';
import { notifyOrderEventInBackground } from './notification.service.js';

const orderIncludes = [
  { model: OrderItem, include: [{ model: ProductVariant, include: [Product] }] },
  { model: User, attributes: ['id', 'name', 'email'] },
  { model: DeliveryZone },
];

const PAYSTACK_CHANNELS = {
  MOBILE_MONEY: ['mobile_money'],
  CARD: ['card'],
};

const frontendUrl = () => (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');

// Unguessable and never reused: Paystack refuses a reference it has already
// seen, which is what stops one order from ever being charged twice.
const newPaymentReference = () => `ELR-${Date.now().toString(36).toUpperCase()}-${randomBytes(6).toString('hex').toUpperCase()}`;

// A repeat of a checkout request we've already handled (double click, retry
// after a dropped connection): hand back the same order instead of making a
// second one. Checked against the email so a leaked key can't reveal someone
// else's order.
const replayOrder = async (existing, customerEmail) => {
  if (existing.customerEmail.toLowerCase() !== customerEmail.toLowerCase()) {
    throw new AppError('This checkout has already been used. Please refresh and try again.', 409, 'IDEMPOTENCY_CONFLICT');
  }
  // Never charge again on a replay: just say where the existing payment is.
  return { order: await getOrderById(existing.id), paymentAction: paymentActionFor(existing) };
};

// What the checkout page should do next for an online order:
//  - card: go to Paystack's page ({ type: 'redirect', url })
//  - mobile money: wait for the phone prompt, or ask for a code
//    ({ type: 'momo', status, displayText })
const paymentActionFor = (order, charge) => {
  if (order.paymentProvider !== 'PAYSTACK' || order.status !== 'PENDING') return null;
  if (order.paymentMethod === 'MOBILE_MONEY') {
    return { type: 'momo', status: charge?.status ?? 'pending', displayText: charge?.display_text ?? null };
  }
  return order.paymentAuthorizationUrl ? { type: 'redirect', url: order.paymentAuthorizationUrl } : null;
};

export const createOrder = async ({
  userId,
  customerName,
  customerEmail,
  customerPhone,
  items,
  fulfillmentMethod = 'PICKUP',
  deliveryAddress,
  deliveryZoneId,
  paymentMethod = 'CASH',
  momoProvider,
  momoPhone,
  idempotencyKey,
}) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('Order must contain at least one item', 400, 'EMPTY_ORDER');
  }

  if (idempotencyKey) {
    const existing = await Order.findOne({ where: { idempotencyKey } });
    if (existing) return replayOrder(existing, customerEmail);
  }

  const payOnline = paymentMethod in PAYSTACK_CHANNELS;
  if (payOnline && !isPaystackConfigured()) {
    throw new AppError('Online payment is not available right now. Please choose cash.', 503, 'PAYMENT_NOT_CONFIGURED');
  }

  // Fee is taken from the zone's current price, never trusted from the
  // request body — same reasoning as unitPrice below.
  let deliveryZone = null;
  if (fulfillmentMethod === 'DELIVERY') {
    deliveryZone = await DeliveryZone.findOne({ where: { id: deliveryZoneId, isActive: true } });
    if (!deliveryZone) {
      throw new AppError('Please choose a valid delivery location', 400, 'INVALID_DELIVERY_ZONE');
    }
  }
  const deliveryFee = deliveryZone ? Number(deliveryZone.firstKgPrice) : 0;

  let order;
  try {
    order = await sequelize.transaction(async (t) => {
      let totalAmount = 0;
      const resolvedItems = [];

      // Resolve and validate every line first, and only then touch stock, so a
      // bad item further down the cart can't leave earlier ones half-deducted.
      for (const item of items) {
        const variant = await ProductVariant.findByPk(item.variantId, { include: Product, transaction: t });
        if (!variant) throw new AppError(`Variant ${item.variantId} not found`, 404, 'VARIANT_NOT_FOUND');

        // Enforced here too, not just hidden in the UI — an admin's manual flag
        // must block the order even if the variant itself still has stock.
        if (variant.Product?.isOutOfStock) {
          throw new AppError(
            `${variant.Product.name} is currently out of stock`,
            409,
            'PRODUCT_OUT_OF_STOCK',
            { variantId: item.variantId }
          );
        }

        const quantity = Number(item.quantity);
        if (!Number.isInteger(quantity) || quantity < 1) {
          throw new AppError('quantity must be a positive integer', 400, 'INVALID_QUANTITY');
        }

        // Price is taken from the variant, never trusted from the request body.
        const unitPrice = Number(variant.price);
        totalAmount += unitPrice * quantity;
        resolvedItems.push({ variantId: variant.id, quantity, unitPrice });
      }

      for (const item of resolvedItems) {
        const remaining = await deductStock(item.variantId, item.quantity, t);
        if (remaining === null) {
          throw new AppError(
            `Not enough stock left for one of the items in your cart (SKU ${item.variantId})`,
            409,
            'INSUFFICIENT_STOCK',
            { variantId: item.variantId }
          );
        }
      }

      totalAmount += deliveryFee;
      // Round to pesewas once, here, so the order total and the amount sent to
      // Paystack can never disagree.
      totalAmount = Math.round(totalAmount * 100) / 100;

      // Every order starts PENDING. Cash is settled in person; online orders
      // only become PAID once Paystack confirms the money (payment.service.js).
      const created = await Order.create(
        {
          userId,
          customerName,
          customerEmail,
          customerPhone,
          totalAmount,
          status: 'PENDING',
          fulfillmentMethod,
          deliveryAddress: fulfillmentMethod === 'DELIVERY' ? deliveryAddress : null,
          deliveryCity: fulfillmentMethod === 'DELIVERY' ? deliveryZone.location : null,
          deliveryZoneId: fulfillmentMethod === 'DELIVERY' ? deliveryZone.id : null,
          deliveryFee,
          paymentMethod,
          paymentProvider: payOnline ? 'PAYSTACK' : null,
          paymentReference: payOnline ? newPaymentReference() : null,
          idempotencyKey: idempotencyKey ?? null,
        },
        { transaction: t }
      );

      await OrderItem.bulkCreate(
        resolvedItems.map((item) => ({ ...item, orderId: created.id })),
        { transaction: t }
      );

      return created;
    });
  } catch (err) {
    // Two copies of the same request raced past the check above; the other
    // one won, so return its order.
    if (idempotencyKey && err instanceof UniqueConstraintError) {
      const existing = await Order.findOne({ where: { idempotencyKey } });
      if (existing) return replayOrder(existing, customerEmail);
    }
    throw err;
  }

  // Payments start only after the order is committed, so Paystack never holds
  // a transaction for an order that doesn't exist.
  if (paymentMethod === 'MOBILE_MONEY') {
    const chargeRequest = {
      email: customerEmail,
      amount: amountToCharge(order.totalAmount),
      reference: order.paymentReference,
      // Test key: swapped for Paystack's test number (see TEST_MOMO_PHONE in paystack.service.js).
      ...momoTarget(momoPhone, momoProvider),
      metadata: { orderId: order.id },
    };
    let charge;
    try {
      try {
        charge = await chargeMobileMoney(chargeRequest);
      } catch (err) {
        // No answer at all (network blip / timeout): try once more with the
        // SAME reference. Paystack refuses a reference it has already seen, so
        // this can never charge twice.
        if (!(err instanceof PaystackError) || err.httpStatus) throw err;
        logger.warn({ err, orderId: order.id }, 'Mobile money charge got no answer; retrying once');
        await new Promise((resolve) => setTimeout(resolve, 1500));
        charge = await chargeMobileMoney(chargeRequest);
      }
    } catch (err) {
      if (err instanceof PaystackError && err.httpStatus && /duplicate/i.test(err.message)) {
        // The first attempt did reach Paystack after all; it's in progress.
        // Leave the order pending: the result page and reconciler confirm it.
        logger.info({ orderId: order.id }, 'Retry found the first charge already at Paystack');
      } else if (err instanceof PaystackError && typeof err.data?.status === 'string') {
        // "Charge attempted": Paystack did try the charge; the outcome is in
        // the body. Handle it below like a normal reply.
        charge = err.data;
      } else if (err instanceof PaystackError && err.httpStatus) {
        // Paystack answered "no" (bad number, network refused, ...): nothing
        // was charged, so release the stock and let the customer fix it.
        logger.warn({ err, paystackData: err.data, orderId: order.id }, 'Mobile money charge refused');
        await cancelUnpaidOrder(order.id);
        throw new AppError(
          "We couldn't send a payment prompt to that number. Check the number and network, then try again.",
          400,
          'MOMO_CHARGE_FAILED'
        );
      } else {
        // Still no answer after the retry: the prompt may or may not have gone
        // out. Keep the order pending; the result page cancels it after a
        // minute if Paystack never heard of it, and the reconciler checks too.
        logger.error({ err, orderId: order.id }, 'Mobile money charge outcome unknown');
      }
    }

    // Paystack: 'timeout' means the charge failed too (customer didn't approve in time).
    if (charge?.status === 'failed' || charge?.status === 'timeout') {
      logger.warn(
        {
          orderId: order.id,
          provider: momoProvider,
          gatewayResponse: charge.gateway_response,
          message: charge.message,
          displayText: charge.display_text,
        },
        'Mobile money charge failed'
      );
      await cancelUnpaidOrder(order.id);
      // On a test key, show Paystack's own reason (e.g. "use the test number")
      // so testing isn't a guessing game. Real customers get the generic text.
      const testMode = process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_test_');
      throw new AppError(
        testMode && charge.gateway_response
          ? `Test mode: ${charge.gateway_response}`
          : "The payment prompt couldn't be sent. Check the number and network, then try again.",
        400,
        'MOMO_CHARGE_FAILED'
      );
    }
    if (charge?.status === 'success') {
      // Some networks settle instantly; record it now (verified with Paystack).
      await confirmPaystackPayment(order.paymentReference).catch((err) =>
        logger.warn({ err, orderId: order.id }, 'Immediate confirm failed; reconciler will retry')
      );
    }
    const fresh = await getOrderById(order.id);
    return { order: fresh, paymentAction: paymentActionFor(fresh, charge) };
  }

  if (payOnline) {
    try {
      const { authorization_url: authorizationUrl } = await initializeTransaction({
        email: customerEmail,
        amount: amountToCharge(order.totalAmount),
        reference: order.paymentReference,
        callbackUrl: `${frontendUrl()}/checkout/payment`,
        channels: PAYSTACK_CHANNELS[paymentMethod],
        metadata: {
          orderId: order.id,
          // Where Paystack's "Cancel payment" button sends the customer.
          cancel_action: `${frontendUrl()}/checkout/payment?reference=${encodeURIComponent(order.paymentReference)}`,
        },
      });
      await Order.update({ paymentAuthorizationUrl: authorizationUrl }, { where: { id: order.id } });
    } catch (err) {
      // No checkout page means the customer can't pay, so don't hold their stock.
      logger.error({ err, orderId: order.id }, 'Could not start Paystack payment');
      await cancelUnpaidOrder(order.id);
      throw new AppError("We couldn't start your payment. Please try again.", 502, 'PAYMENT_INIT_FAILED');
    }
  }

  // Cash orders are "done" at checkout, so tell everyone now. Online orders
  // notify when their payment is confirmed (payment.service.js).
  if (paymentMethod === 'CASH') notifyOrderEventInBackground(order.id, 'PLACED');

  const fresh = await getOrderById(order.id);
  return { order: fresh, paymentAction: paymentActionFor(fresh) };
};

export const getAllOrders = async ({ page = 1, limit = 10, status, userId }) => {
  const offset = (page - 1) * limit;
  const where = {};
  if (status) where.status = status;
  if (userId) where.userId = userId;

  const { count, rows } = await Order.findAndCountAll({
    where,
    limit,
    offset,
    order: [['createdAt', 'DESC']],
    include: orderIncludes,
    distinct: true,
  });

  return {
    orders: rows,
    total: count,
    page,
    totalPages: Math.ceil(count / limit),
  };
};

export const getOrderById = async (id) => {
  const order = await Order.findByPk(id, { include: orderIncludes });
  if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
  return order;
};

export const getItemsByOrder = async (orderId) => {
  return OrderItem.findAll({
    where: { orderId },
    include: [{ model: ProductVariant, include: [Product] }],
    order: [['createdAt', 'ASC']],
  });
};

export const updateOrder = async (id, data) => {
  const order = await Order.findByPk(id);
  if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

  const allowedFields = ['status', 'zohoSyncStatus', 'zohoSalesOrderId', 'syncErrorMessage', 'lastSyncedAt'];
  const updates = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) updates[field] = data[field];
  }

  await order.update(updates);
  return getOrderById(id);
};

export const retrySync = async (id) => {
  const order = await Order.findByPk(id);
  if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');

  await order.update({ zohoSyncStatus: 'PENDING', syncErrorMessage: null });
  return getOrderById(id);
};

export const deleteOrder = async (id) => {
  const order = await Order.findByPk(id);
  if (!order) throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
  await order.destroy();
};
