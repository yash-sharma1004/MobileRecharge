import express from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import * as walletController from './wallet.controller.js';
import { rateLimit } from 'express-rate-limit';

const router = express.Router();

// Rate limiter: 5 requests per minute per IP
const walletRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  message: {
    success: false,
    message: 'Too many wallet attempts. Please try again in a minute.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.use(protect);

router.get('/', walletController.getWallet);
router.get('/transactions', walletController.getTransactions);
router.post('/create-order', walletRateLimiter, walletController.createOrder);
router.post('/verify-payment', walletRateLimiter, walletController.verifyPayment);

export default router;
