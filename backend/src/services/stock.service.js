import { QueryTypes } from 'sequelize';
import { sequelize, OrderItem } from '../models/index.js';

// Deducts stock atomically and only if enough is left, so two people buying
// the last unit at the same moment can't both succeed. Returns the new
// stockQuantity, or null if there wasn't enough stock.
export const deductStock = async (variantId, quantity, transaction) => {
  const rows = await sequelize.query(
    `UPDATE product_variants
     SET "stockQuantity" = "stockQuantity" - :quantity, "updatedAt" = now()
     WHERE id = :variantId AND "stockQuantity" >= :quantity
     RETURNING "stockQuantity"`,
    { replacements: { variantId, quantity }, transaction, type: QueryTypes.SELECT }
  );
  return rows[0]?.stockQuantity ?? null;
};

// Puts an order's items back on the shelf. Callers must hold a lock on the
// order row and only call this once per order (i.e. while moving it out of
// PENDING), or stock would be returned twice.
export const restockOrderItems = async (orderId, transaction) => {
  const items = await OrderItem.findAll({ where: { orderId }, transaction });
  for (const item of items) {
    await sequelize.query(
      `UPDATE product_variants
       SET "stockQuantity" = "stockQuantity" + :quantity, "updatedAt" = now()
       WHERE id = :variantId`,
      { replacements: { variantId: item.variantId, quantity: item.quantity }, transaction }
    );
  }
};

// Takes an order's items off the shelf again (an expired order that got paid
// after all). All or nothing: runs in a savepoint, so if any line is short
// the ones already deducted are undone. Returns whether it succeeded.
export const reserveOrderItems = async (orderId, transaction) => {
  try {
    await sequelize.transaction({ transaction }, async (savepoint) => {
      const items = await OrderItem.findAll({ where: { orderId }, transaction: savepoint });
      for (const item of items) {
        const remaining = await deductStock(item.variantId, item.quantity, savepoint);
        if (remaining === null) throw new Error('INSUFFICIENT_STOCK');
      }
    });
    return true;
  } catch (err) {
    if (err.message === 'INSUFFICIENT_STOCK') return false;
    throw err;
  }
};
