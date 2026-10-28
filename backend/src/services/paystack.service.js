import { createHmac, timingSafeEqual } from 'node:crypto';
import AppError from '../utils/AppError.js';

// Thin client for the three Paystack calls we need. Plain fetch, no SDK.
// Test vs live is decided purely by which secret key is in the env
// (sk_test_... or sk_live_...).

const BASE_URL = 'https://api.paystack.co';
const TIMEOUT_MS = 15_000;

export const PAYSTACK_CURRENCY = process.env.PAYSTACK_CURRENCY || 'GHS';

export class PaystackError extends Error {
  constructor(message, { httpStatus, data, cause } = {}) {
    super(message, { cause });
    this.name = 'PaystackError';
    this.httpStatus = httpStatus;
    // Paystack's response body, if any. A mobile money charge can come back as
    // HTTP 400 "Charge attempted" with the real outcome in here
    // ({ status: 'failed' | 'send_otp' | ..., gateway_response, display_text }).
    this.data = data;
  }
}

const secretKey = () => {
  const key = process.env.PAYSTACK_SECRET_KEY;
  if (!key) {
    throw new AppError('Online payment is not available right now', 503, 'PAYMENT_NOT_CONFIGURED');
  }
  return key;
};

export const isPaystackConfigured = () => !!process.env.PAYSTACK_SECRET_KEY;

// GHS 65.50 -> 6550. Paystack only takes whole pesewas.
export const toMinorUnits = (amount) => Math.round(Number(amount) * 100);

// TESTING ONLY: set PAYSTACK_AMOUNT_OVERRIDE (e.g. 0.2) to charge that flat
// amount instead of the order total, so test payments with a live key cost
// next to nothing. The order still records its real total. Remove the
// setting before taking real orders.
export const amountOverride = () => {
  const value = Number(process.env.PAYSTACK_AMOUNT_OVERRIDE);
  return Number.isFinite(value) && value > 0 ? value : null;
};

// What Paystack actually charges for an order (and what we check was paid).
export const amountToCharge = (orderTotal) => amountOverride() ?? Number(orderTotal);

async function request(path, { method = 'GET', body } = {}) {
  const key = secretKey();
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch (err) {
    throw new PaystackError('Could not reach Paystack', { cause: err });
  }

  const json = await res.json().catch(() => null);
  if (!res.ok || json?.status !== true) {
    throw new PaystackError(json?.message || `Paystack responded with ${res.status}`, {
      httpStatus: res.status,
      data: json?.data,
    });
  }
  return json.data;
}

// Starts a transaction and returns { authorization_url, access_code, reference }.
// Paystack rejects a reference it has seen before, so one reference can never
// turn into two charges.
export const initializeTransaction = ({ email, amount, reference, callbackUrl, channels, metadata }) =>
  request('/transaction/initialize', {
    method: 'POST',
    body: {
      email,
      amount: toMinorUnits(amount),
      currency: PAYSTACK_CURRENCY,
      reference,
      callback_url: callbackUrl,
      channels,
      metadata,
    },
  });

// Ghana networks -> Paystack's provider codes.
export const MOMO_PROVIDERS = { MTN: 'mtn', TELECEL: 'vod', AIRTELTIGO: 'atl' };


export const TEST_MOMO_PHONE = '0551234987';
export const TEST_MOMO_PROVIDER = 'MTN';

export const isTestMode = () => process.env.PAYSTACK_SECRET_KEY?.startsWith('sk_test_') ?? false;

export const momoTarget = (phone, provider) =>
  isTestMode() ? { phone: TEST_MOMO_PHONE, provider: TEST_MOMO_PROVIDER } : { phone, provider };

export const chargeMobileMoney = ({ email, amount, reference, phone, provider, metadata }) =>
  request('/charge', {
    method: 'POST',
    body: {
      email,
      amount: toMinorUnits(amount),
      currency: PAYSTACK_CURRENCY,
      reference,
      mobile_money: { phone, provider: MOMO_PROVIDERS[provider] },
      metadata,
    },
  });

export const submitChargeOtp = ({ reference, otp }) =>
  request('/charge/submit_otp', { method: 'POST', body: { reference, otp } });

// The source of truth for whether money moved. Returns Paystack's transaction
// (status: 'success' | 'failed' | 'abandoned' | 'ongoing' | 'pending' | ...),
// or null if Paystack has never heard of the reference.
export const verifyTransaction = async (reference) => {
  try {
    return await request(`/transaction/verify/${encodeURIComponent(reference)}`);
  } catch (err) {
    if (err instanceof PaystackError && (err.httpStatus === 400 || err.httpStatus === 404)) return null;
    throw err;
  }
};

// Our webhook's proof that a request really came from Paystack: an HMAC-SHA512
// of the exact raw body, keyed with our secret key. Compared in constant time.
export const isValidWebhookSignature = (rawBody, signature) => {
  if (!rawBody || typeof signature !== 'string' || !isPaystackConfigured()) return false;
  const expected = createHmac('sha512', secretKey()).update(rawBody).digest('hex');
  const given = Buffer.from(signature, 'utf8');
  const wanted = Buffer.from(expected, 'utf8');
  return given.length === wanted.length && timingSafeEqual(given, wanted);
};
