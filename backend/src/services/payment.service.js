import { Op } from 'sequelize';
import { sequelize, Order } from '../models/index.js';
import logger from '../utils/logger.js';
import {
  PAYSTACK_CURRENCY,
  amountOverride,
  amountToCharge,
  isTestMode,
  TEST_MOMO_PHONE,
  TEST_MOMO_PROVIDER,
  toMinorUnits,
  verifyTransaction,
  isPaystackConfigured,
} from './paystack.service.js';
import { restockOrderItems, reserveOrderItems } from './stock.service.js';
import { notifyOrderEventInBackground } from './notification.service.js';

// How a Paystack order gets settled. Three independent triggers all funnel
// into applyPaystackTransaction, so a payment is never missed:
//   1. the customer lands back on our site after paying (POST /payments/paystack/verify)
//   2. our webhook (POST /payments/paystack/webhook), if Paystack can reach us
//   3. the reconciler below, which sweeps pending orders every few minutes
// None of them trust what they're told: each asks Paystack's verify API, and
// the order is changed under a row lock, so running them all at once is safe.

// Paystack statuses meaning the customer hasn't finished yet and may still pay.
const IN_PROGRESS = new Set(['ongoing', 'pending', 'processing', 'queued', 'pay_offline', 'send_otp','send_pin', 'send_phone', 'send_birthday', 'send_address', 'open_url']);
// Statuses meaning this attempt is over without money moving.
const UNPAID = new Set(['failed', 'abandoned', 'reversed', 'timeout']);

const timeoutMinutes = () => Number(process.env.PAYSTACK_PAYMENT_TIMEOUT_MINUTES) || 30;
// A mobile money prompt that is still "pending" after a day is not coming.
const HARD_LIMIT_MS = 24 * 60 * 60 * 1000;

export const isPaystackInProgress = (status) => IN_PROGRESS.has(status);

// Records a verified Paystack transaction against its order. Idempotent: the
// first call to see a successful payment marks the order PAID; every later
// call (webhook retries, the customer refreshing, the reconciler) finds it
// already PAID and changes nothing.
export const applyPaystackTransaction = async (reference, tx) => {
  // Set only by the one call that actually moves the order to PAID, so the
  // "payment received" emails go out exactly once.
  let becamePaid = false;
  const result = await sequelize.transaction(async (t) => {
    const order = await Order.findOne({
      where: { paymentReference: reference, paymentProvider: 'PAYSTACK' },
      transaction: t,
      lock: t.LOCK.UPDATE,
    });
    if (!order) return null;
    if (!tx || tx.status !== 'success') return order;
    if (order.status === 'PAID' || order.status === 'REFUNDED') return order;

    // Money moved, but only accept it if it's exactly what this order costs.
    const problems = [];
    if (tx.reference !== reference) problems.push(`reference ${tx.reference} does not match ${reference}`);
    if (tx.currency !== PAYSTACK_CURRENCY) problems.push(`paid in ${tx.currency}, expected ${PAYSTACK_CURRENCY}`);
    const expected = amountToCharge(order.totalAmount);
    if (Number(tx.amount) !== toMinorUnits(expected)) {
      problems.push(`paid ${(Number(tx.amount) / 100).toFixed(2)}, expected ${expected.toFixed(2)}`);
    }

    const paymentDetails = { paystackTransactionId: String(tx.id), paymentChannel: tx.channel ?? null };

    if (problems.length > 0) {
      const reason = `Payment needs review: ${problems.join('; ')}`;
      if (order.paymentReviewReason !== reason) {
        await order.update({ ...paymentDetails, paymentReviewReason: reason }, { transaction: t });
        logger.error({ orderId: order.id, reference, problems }, 'Paystack payment does not match order; not marking paid');
      }
      return order;
    }

    // Paid after the order had expired and its stock was released: try to
    // take the stock back. Either way the money is in, so it's PAID, but flag
    // it if we can't actually fulfil it.
    let reviewReason = null;
    if (order.status === 'CANCELLED') {
      const reserved = await reserveOrderItems(order.id, t);
      reviewReason = reserved
        ? 'Paid after the order had expired; items were reserved again.'
        : 'Paid after the order expired and some items are no longer in stock. Restock or refund before fulfilling.';
    }

    await order.update(
      {
        ...paymentDetails,
        status: 'PAID',
        paidAt: tx.paid_at ? new Date(tx.paid_at) : new Date(),
        paymentReviewReason: reviewReason,
      },
      { transaction: t }
    );
    logger.info({ orderId: order.id, reference, channel: tx.channel }, 'Order paid via Paystack');
    becamePaid = true;
    return order;
  });
  // After commit, and never awaited: email trouble can't undo or delay a payment.
  if (becamePaid) notifyOrderEventInBackground(result.id, 'PAID');
  return result;
};

// Asks Paystack about a reference and applies the answer.
export const confirmPaystackPayment = async (reference) => {
  const tx = await verifyTransaction(reference);
  const order = await applyPaystackTransaction(reference, tx);
  return { order, paystackStatus: tx?.status ?? 'not_found' };
};

// Gives up on an unpaid order and puts its stock back. Only acts on PENDING
// orders, checked under the row lock, so stock can't be returned twice.
export const cancelUnpaidOrder = (orderId) =>
  sequelize.transaction(async (t) => {
    const order = await Order.findByPk(orderId, { transaction: t, lock: t.LOCK.UPDATE });
    if (!order || order.status !== 'PENDING') return order;
    await restockOrderItems(order.id, t);
    await order.update({ status: 'CANCELLED' }, { transaction: t });
    logger.info({ orderId: order.id, reference: order.paymentReference }, 'Unpaid order cancelled and stock released');
    return order;
  });

let sweeping = false;

// Catches every payment the other two triggers missed (customer closed the
// tab, webhook never arrived) and releases stock held by abandoned checkouts.
export const reconcilePendingPayments = async () => {
  if (sweeping || !isPaystackConfigured()) return;
  sweeping = true;
  try {
    const cutoff = new Date(Date.now() - timeoutMinutes() * 60 * 1000);
    const orders = await Order.findAll({
      where: {
        paymentProvider: 'PAYSTACK',
        status: 'PENDING',
        paymentReviewReason: null, // flagged ones wait for a human
        createdAt: { [Op.lt]: cutoff },
      },
      order: [['createdAt', 'ASC']],
      limit: 50,
    });

    for (const order of orders) {
      try {
        const tx = await verifyTransaction(order.paymentReference);
        if (tx?.status === 'success') {
          await applyPaystackTransaction(order.paymentReference, tx);
          continue;
        }
        const tooOld = Date.now() - new Date(order.createdAt).getTime() > HARD_LIMIT_MS;
        if (!tx || UNPAID.has(tx.status) || tooOld) {
          await cancelUnpaidOrder(order.id);
        }
        // Otherwise the customer is mid-payment (e.g. an unanswered MoMo prompt): look again next sweep.
      } catch (err) {
        logger.warn({ err, orderId: order.id }, 'Could not reconcile order; will retry next sweep');
      }
    }
  } catch (err) {
    logger.error({ err }, 'Payment reconciliation sweep failed');
  } finally {
    sweeping = false;
  }
};

export const startPaymentReconciler = () => {
  if (!isPaystackConfigured()) {
    logger.warn('PAYSTACK_SECRET_KEY is not set: online payments are disabled');
    return;
  }
  if (isTestMode()) {
    logger.warn(
      `Paystack TEST mode: mobile money charges go to test number ${TEST_MOMO_PHONE} (${TEST_MOMO_PROVIDER}), not the number customers type. Switches off automatically with a live key.`
    );
  }
  if (amountOverride() !== null) {
    logger.warn(
      `PAYSTACK_AMOUNT_OVERRIDE is set: every online payment charges GHS ${amountOverride().toFixed(2)} instead of the order total. Remove it before taking real orders.`
    );
  }
  const everyMs = (Number(process.env.PAYSTACK_RECONCILE_INTERVAL_MINUTES) || 5) * 60 * 1000;
  setTimeout(reconcilePendingPayments, 10_000).unref();
  setInterval(reconcilePendingPayments, everyMs).unref();
  logger.info(`Payment reconciler running every ${everyMs / 60000} min`);
};
