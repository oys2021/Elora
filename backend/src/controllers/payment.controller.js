import { z } from 'zod';
import { sendData } from '../utils/ApiResponse.js';
import AppError from '../utils/AppError.js';
import { isValidWebhookSignature, PaystackError, submitChargeOtp } from '../services/paystack.service.js';
import {
  applyPaystackTransaction,
  cancelUnpaidOrder,
  confirmPaystackPayment,
  isPaystackInProgress,
} from '../services/payment.service.js';
import { Order } from '../models/index.js';

const verifySchema = z.object({
  reference: z.string().trim().min(1).max(100),
});

// Only what the payment result page needs: no names, emails or addresses,
// since anyone holding the reference can call this.
const toPaymentResult = (order, paystackStatus) => ({
  orderId: order.id,
  status: order.status,
  paystackStatus,
  inProgress: isPaystackInProgress(paystackStatus),
  totalAmount: Number(order.totalAmount),
  fulfillmentMethod: order.fulfillmentMethod,
  paymentMethod: order.paymentMethod,
  paymentReference: order.paymentReference,
  // Lets "Try again" reopen the same Paystack transaction instead of a new one.
  paymentAuthorizationUrl: order.status === 'PENDING' ? order.paymentAuthorizationUrl : null,
});

// POST /payments/paystack/verify  { reference }
// Called by the page Paystack sends the customer back to. Never trusts the
// browser: it asks Paystack what happened and records that.
export const verifyPaystack = async (req, res, next) => {
  try {
    const parsed = verifySchema.safeParse(req.body ?? {});
    if (!parsed.success) throw new AppError('Missing payment reference', 400, 'VALIDATION_ERROR');
    const { reference } = parsed.data;

    let result;
    try {
      result = await confirmPaystackPayment(reference);
    } catch (err) {
      if (!(err instanceof PaystackError)) throw err;
      // Paystack unreachable right now: report what we know; the page will
      // ask again and the reconciler will catch up regardless.
      req.log.warn({ err, reference }, 'Paystack verify failed');
      const order = await applyPaystackTransaction(reference, null);
      result = { order, paystackStatus: 'unknown' };
    }

    if (!result.order) throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');

    // A mobile money charge Paystack has never heard of, a minute after the
    // order was placed, never reached them (e.g. a network failure) and never
    // will: cancel it now (releases the stock) rather than leave the customer
    // waiting. A charge that *was* attempted shows up immediately, so a
    // minute is plenty.
    const ageMs = Date.now() - new Date(result.order.createdAt).getTime();
    if (
      result.paystackStatus === 'not_found' &&
      result.order.paymentMethod === 'MOBILE_MONEY' &&
      result.order.status === 'PENDING' &&
      ageMs > 60_000
    ) {
      const cancelled = await cancelUnpaidOrder(result.order.id);
      sendData(res, toPaymentResult(cancelled ?? result.order, 'not_found'));
      return;
    }

    sendData(res, toPaymentResult(result.order, result.paystackStatus));
  } catch (err) {
    next(err);
  }
};

const otpSchema = z.object({
  reference: z.string().trim().min(1).max(100),
  otp: z.string().trim().min(3).max(12),
});

// POST /payments/paystack/submit-otp  { reference, otp }
// Some networks ask the customer for a code mid-charge. We pass it to
// Paystack, then confirm the outcome the same way as /verify.
export const submitPaystackOtp = async (req, res, next) => {
  try {
    const parsed = otpSchema.safeParse(req.body ?? {});
    if (!parsed.success) throw new AppError('Enter the code you received', 400, 'VALIDATION_ERROR');
    const { reference, otp } = parsed.data;

    const order = await Order.findOne({ where: { paymentReference: reference, paymentMethod: 'MOBILE_MONEY' } });
    if (!order) throw new AppError('Payment not found', 404, 'PAYMENT_NOT_FOUND');

    let charge;
    try {
      charge = await submitChargeOtp({ reference, otp });
    } catch (err) {
      if (!(err instanceof PaystackError)) throw err;
      // Same as charging: a 400 can still carry the real outcome in its body.
      if (typeof err.data?.status === 'string' && err.data.status !== 'failed') {
        charge = err.data;
      } else {
        req.log.warn({ err, paystackData: err.data, reference }, 'Paystack OTP submission failed');
        throw new AppError("That code didn't work. Check it and try again.", 400, 'OTP_FAILED');
      }
    }

    const result = await confirmPaystackPayment(reference).catch(async () => ({
      order: await Order.findOne({ where: { paymentReference: reference } }),
      paystackStatus: 'unknown',
    }));
    sendData(res, {
      ...toPaymentResult(result.order, result.paystackStatus),
      chargeStatus: charge.status,
      displayText: charge.display_text ?? null,
    });
  } catch (err) {
    next(err);
  }
};

// POST /payments/paystack/webhook
// Our own webhook endpoint. Paystack signs every call with our secret key;
// anything without a valid signature is dropped. Even a valid event is only
// treated as a nudge: we re-check the transaction with Paystack's verify API
// before touching the order, so a replayed or stale event can't do harm.
export const paystackWebhook = async (req, res) => {
  if (!isValidWebhookSignature(req.rawBody, req.get('x-paystack-signature'))) {
    req.log.warn('Rejected Paystack webhook with an invalid signature');
    return res.sendStatus(401);
  }

  const { event, data } = req.body ?? {};
  try {
    if (event === 'charge.success' && typeof data?.reference === 'string') {
      const known = await Order.count({ where: { paymentReference: data.reference } });
      if (known) await confirmPaystackPayment(data.reference);
    }
    res.sendStatus(200);
  } catch (err) {
    // A non-2xx makes Paystack retry later, which is safe: applying a payment twice changes nothing.
    req.log.error({ err, event, reference: data?.reference }, 'Paystack webhook processing failed');
    res.sendStatus(500);
  }
};
