import express from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import * as paymentController from './payment.controller.js';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();

// Rate limiter: 5 requests per minute per IP for secure actions
const paymentRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    success: false,
    message: 'Too many payment requests. Please try again in a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Razorpay Webhook is public and signature-verified inside controller
router.post('/webhook', paymentController.handleWebhook);

// Secure payment actions
router.use(protect);
router.post('/create-order', paymentRateLimiter, paymentController.createOrder);
router.post('/verify', paymentRateLimiter, paymentController.verifyPayment);
router.post('/verify-recharge', paymentRateLimiter, paymentController.verifyRechargePayment);

export default router;
