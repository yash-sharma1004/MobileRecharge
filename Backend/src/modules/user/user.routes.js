import express from 'express';
import { getProfile } from './user.controller.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // Protect all user routes

router.get('/me', getProfile);

export default router;
