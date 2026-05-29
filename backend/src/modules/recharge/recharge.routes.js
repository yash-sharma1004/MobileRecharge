import express from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import * as rechargeController from './recharge.controller.js';

const router = express.Router();

router.use(protect);

router.post('/', rechargeController.createRecharge);
router.get('/', rechargeController.getHistory);
router.get('/last', rechargeController.getLastRecharge);
router.get('/expiry', rechargeController.getExpiry);
router.post('/retry/:rechargeId', rechargeController.retryRecharge);
router.get('/coupons', rechargeController.getCoupons);
router.get('/offers', rechargeController.getOffers);

export default router;
