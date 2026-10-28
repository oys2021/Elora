import { Router } from 'express';
import { verifyPaystack, submitPaystackOtp, paystackWebhook } from '../controllers/payment.controller.js';

const router = Router();

// Public on purpose: guests pay too, and the webhook is called by Paystack.
// The webhook authenticates itself by signature (see the controller).
router.post('/payments/paystack/verify', verifyPaystack);
router.post('/payments/paystack/submit-otp', submitPaystackOtp);
router.post('/payments/paystack/webhook', paystackWebhook);

export default router;
