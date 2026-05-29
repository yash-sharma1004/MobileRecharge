import express from 'express';
import rateLimit from 'express-rate-limit';
import { 
  register, 
  login, 
  logout,
  sendLoginOTP,
  verifyLoginOTP,
  sendForgotPasswordOTP,
  verifyForgotPasswordOTP,
  resetPassword
} from './auth.controller.js';

const router = express.Router();

// Rate limiter for OTP requests (5 per hour per IP)
const otpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 100,
  message: { success: false, message: 'Too many OTP requests from this IP, please try again after an hour' }
});

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);

// OTP Login Routes
router.post('/login-otp/send', otpRateLimiter, sendLoginOTP);
router.post('/login-otp/verify', verifyLoginOTP);

// Forgot Password Routes
router.post('/forgot-password/send', otpRateLimiter, sendForgotPasswordOTP);
router.post('/forgot-password/verify', verifyForgotPasswordOTP);
router.post('/forgot-password/reset', resetPassword);

export default router;
