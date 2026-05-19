import express from 'express';
import cors from 'cors';
import { errorMiddleware } from './middleware/error.middleware.js';
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/user/user.routes.js';
import rechargeRoutes from './modules/recharge/recharge.routes.js';
import walletRoutes from './modules/wallet/wallet.routes.js';
import referralRoutes from './modules/referral/referral.routes.js';

const app = express();

// Global Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Mobile Recharge API is running' });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/recharges', rechargeRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/referrals', referralRoutes);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: 'API route not found' });
});

// Global Error Handler
app.use(errorMiddleware);

export default app;
