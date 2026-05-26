import express from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import { adminOnly } from '../../middleware/admin.middleware.js';
import * as providerController from './provider.controller.js';

const router = express.Router();

router.get('/status', protect, providerController.getProviders);
router.get('/admin/status', protect, adminOnly, providerController.getProviders);

export default router;
