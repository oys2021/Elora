import { QueryTypes } from 'sequelize';
import { sequelize, Order, OrderItem, ProductVariant, Product, User } from '../models/index.js';
import AppError from '../utils/AppError.js';
import { chargeDummyPayment } from './dummyPayment.service.js';

const orderIncludes = [
  { model: OrderItem, include: [{ model: ProductVariant, include: [Product] }] },
  { model: User, attributes: ['id', 'name', 'email'] },
];

// Deducts stock atomically and only if enough is left, so two people buying
// the last unit at the same moment can't both succeed. Returns the new
// stockQuantity, or null if there wasn't enough stock.
const deductStock = async (variantId, quantity, transaction) => {
  const rows = await sequelize.query(
    `UPDATE product_variants
     SET "stockQuantity" = "stockQuantity" - :quantity, "updatedAt" = now()
     WHERE id = :variantId AND "stockQuantity" >= :quantity
     RETURNING "stockQuantity"`,
    { replacements: { variantId, quantity }, transaction, type: QueryTypes.SELECT }
  );
  return rows[0]?.stockQuantity ?? null;
};

export const createOrder = async ({
  userId,
  customerName,
  customerEmail,
  customerPhone,
  items,
  fulfillmentMethod = 'PICKUP',
  deliveryAddress,
  deliveryCity,
  paymentMethod = 'CASH',
}) => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError('Order must contain at least one item', 400, 'EMPTY_ORDER');
  }

  const order = await sequelize.transaction(async (t) => {
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

    // Dummy gateway: cash stays PENDING (paid in person); mobile money is
    // simulated as an immediate success. See dummyPayment.service.js.
    const payment = await chargeDummyPayment({ method: paymentMethod, amount: totalAmount });

    const created = await Order.create(
      {
        userId,
        customerName,
        customerEmail,
        customerPhone,
        totalAmount,
        status: payment.status,
        fulfillmentMethod,
        deliveryAddress: fulfillmentMethod === 'DELIVERY' ? deliveryAddress : null,
        deliveryCity: fulfillmentMethod === 'DELIVERY' ? deliveryCity : null,
        paymentMethod,
        paymentReference: payment.reference,
      },
      { transaction: t }
    );

    await OrderItem.bulkCreate(
      resolvedItems.map((item) => ({ ...item, orderId: created.id })),
      { transaction: t }
    );

    return created;
  });

  return getOrderById(order.id);
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
