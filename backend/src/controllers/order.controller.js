import { z } from 'zod';
import { sendData } from '../utils/ApiResponse.js';
import AppError from '../utils/AppError.js';
import {
  createOrder,
  getAllOrders,
  getOrderById,
  getItemsByOrder,
  updateOrder,
  retrySync,
  deleteOrder,
} from '../services/order.service.js';


function assertCanView(req, order) {
  if (!req.user.isAdmin && order.userId !== req.user.id) {
    throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
  }
}

// "024 123 4567", "+233241234567", "233241234567", "241234567" -> "0241234567".
// Returns null if it isn't a 10-digit Ghana mobile number.
function normalizeGhanaPhone(value) {
  if (!value) return null;
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('233')) digits = `0${digits.slice(3)}`;
  else if (digits.length === 9) digits = `0${digits}`;
  return /^0[2-5]\d{8}$/.test(digits) ? digits : null;
}

const createSchema = z
  .object({
    customerName: z.string({ error: 'Name is required' }).trim().min(1, 'Name is required'),
    customerEmail: z.string({ error: 'Email is required' }).trim().pipe(z.email('Enter a valid email address')),
    customerPhone: z.string({ error: 'Phone number is required' }).trim().min(6, 'Enter a valid phone number'),
    items: z
      .array(
        z.object({
          variantId: z.uuid('Invalid item in cart'),
          quantity: z.int('Quantity must be a whole number').positive('Quantity must be at least 1'),
        })
      )
      .min(1, 'Your cart is empty'),
    fulfillmentMethod: z.enum(['PICKUP', 'DELIVERY']).default('PICKUP'),
    deliveryAddress: z.string().trim().optional(),
    deliveryZoneId: z.uuid('Please choose a valid delivery location').optional(),
    paymentMethod: z.enum(['CASH', 'MOBILE_MONEY', 'CARD']).default('CASH'),
    // Mobile money only: which network, and the wallet number to prompt.
    momoProvider: z.enum(['MTN', 'TELECEL', 'AIRTELTIGO']).optional(),
    momoPhone: z.string().trim().optional(),
    idempotencyKey: z.string().trim().min(8).max(100).optional(),
  })
  .check((ctx) => {
    if (ctx.value.paymentMethod === 'MOBILE_MONEY') {
      if (!ctx.value.momoProvider) {
        ctx.issues.push({ code: 'custom', path: ['momoProvider'], message: 'Choose your mobile money network', input: ctx.value });
      }
      if (!normalizeGhanaPhone(ctx.value.momoPhone)) {
        ctx.issues.push({ code: 'custom', path: ['momoPhone'], message: 'Enter a valid mobile money number', input: ctx.value });
      }
    }
    if (ctx.value.fulfillmentMethod !== 'DELIVERY') return;
    if (!ctx.value.deliveryAddress) {
      ctx.issues.push({ code: 'custom', path: ['deliveryAddress'], message: 'Delivery address is required', input: ctx.value });
    }
    if (!ctx.value.deliveryZoneId) {
      ctx.issues.push({ code: 'custom', path: ['deliveryZoneId'], message: 'Please choose a delivery location', input: ctx.value });
    }
  });

function parse(schema, body) {
  const result = schema.safeParse(body ?? {});
  if (result.success) return result.data;

  const details = {};
  for (const issue of result.error.issues) {
    details[String(issue.path[0] ?? 'form')] ??= issue.message;
  }
  throw new AppError('Please check the highlighted fields', 400, 'VALIDATION_ERROR', details);
}

export const create = async (req, res, next) => {
  try {
    const values = parse(createSchema, req.body);
    const userId = req.user?.id ?? null;
    if (values.paymentMethod === 'MOBILE_MONEY') values.momoPhone = normalizeGhanaPhone(values.momoPhone);
    const { order, paymentAction } = await createOrder({ ...values, userId });
    // paymentAction tells the checkout page what to do next for online payments.
    sendData(res, { ...order.toJSON(), paymentAction }, 201);
  } catch (err) {
    next(err);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const { status } = req.query;
    const userId = req.user.isAdmin ? req.query.userId : req.user.id;
    const result = await getAllOrders({ page, limit, status, userId });
    sendData(res, result.orders, 200, {
      total: result.total,
      page: result.page,
      totalPages: result.totalPages,
    });
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const order = await getOrderById(req.params.id);
    assertCanView(req, order);
    sendData(res, order);
  } catch (err) {
    next(err);
  }
};

export const getItems = async (req, res, next) => {
  try {
    assertCanView(req, await getOrderById(req.params.orderId));
    const items = await getItemsByOrder(req.params.orderId);
    sendData(res, items);
  } catch (err) {
    next(err);
  }
};

export const update = async (req, res, next) => {
  try {
    const order = await updateOrder(req.params.id, req.body);
    sendData(res, order);
  } catch (err) {
    next(err);
  }
};

export const sync = async (req, res, next) => {
  try {
    const order = await retrySync(req.params.id);
    sendData(res, order);
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    await deleteOrder(req.params.id);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};
