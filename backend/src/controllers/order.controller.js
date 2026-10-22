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

// Admins can open any order; a customer only their own. Anything else looks like it doesn't exist.
function assertCanView(req, order) {
  if (!req.user.isAdmin && order.userId !== req.user.id) {
    throw new AppError('Order not found', 404, 'ORDER_NOT_FOUND');
  }
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
    deliveryCity: z.string().trim().optional(),
    paymentMethod: z.enum(['CASH', 'MTN', 'TELECEL', 'AIRTELTIGO']).default('CASH'),
  })
  .check((ctx) => {
    if (ctx.value.fulfillmentMethod !== 'DELIVERY') return;
    if (!ctx.value.deliveryAddress) {
      ctx.issues.push({ code: 'custom', path: ['deliveryAddress'], message: 'Delivery address is required', input: ctx.value });
    }
    if (!ctx.value.deliveryCity) {
      ctx.issues.push({ code: 'custom', path: ['deliveryCity'], message: 'City is required', input: ctx.value });
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
    // The order belongs to whoever is signed in (or nobody, for a guest checkout). Never trust a userId from the request.
    const userId = req.user?.id ?? null;
    const order = await createOrder({ ...values, userId });
    sendData(res, order, 201);
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
