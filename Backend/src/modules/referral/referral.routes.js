import express from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import * as referralController from './referral.controller.js';

const router = express.Router();

router.use(protect);

router.get('/', referralController.getReferralData);
router.get('/leaderboard', referralController.getLeaderboard);

export default router;
