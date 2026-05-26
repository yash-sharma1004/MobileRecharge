import express from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import { adminOnly } from '../../middleware/admin.middleware.js';
import * as adminController from './admin.controller.js';

const router = express.Router();

// Protect all routes under this admin router
router.use(protect);
router.use(adminOnly);

// 1. Dashboard & Analytics
router.get('/analytics', adminController.getDashboardAnalytics);

// 2. User Management
router.get('/users', adminController.getUsers);
router.get('/users/:id/history', adminController.getUserHistory);
router.put('/users/:id/block', adminController.blockUnblockUser);
router.put('/users/:id/wallet', adminController.adjustUserWallet);

// 3. Recharge & Refund Actions
router.get('/recharges', adminController.getRecharges);
router.post('/recharges/:id/retry', adminController.retryRecharge);
router.post('/recharges/:id/refund', adminController.refundRecharge);

// 4. Wallet Audits
router.get('/wallet-transactions', adminController.getWalletTransactions);

// 5. Coupon CRUD
router.get('/coupons', adminController.getCoupons);
router.post('/coupons', adminController.createCoupon);
router.put('/coupons/:id', adminController.updateCoupon);
router.delete('/coupons/:id', adminController.deleteCoupon);

// 6. Cashback rules
router.get('/cashback-rules', adminController.getCashbackRules);
router.put('/cashback-rules', adminController.updateCashbackRule);

// 7. Referral Audit
router.get('/referrals', adminController.getReferrals);

// 8. Dynamic Offers CRUD
router.get('/offers', adminController.getOffers);
router.post('/offers', adminController.createOffer);
router.put('/offers/:id', adminController.updateOffer);
router.delete('/offers/:id', adminController.deleteOffer);

export default router;
