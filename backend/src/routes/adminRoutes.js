import express from 'express';
import { getAdminDashboard } from '../controllers/adminController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.use(restrictTo('ADMIN'));

router.get('/dashboard', getAdminDashboard);

export default router;
