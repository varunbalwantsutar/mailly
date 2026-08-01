import { Router } from 'express';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { getDashboardStats } from '../controllers/dashboardController.js';

const router = Router();

router.use(requireAuth);

router.get('/stats', getDashboardStats);

export default router;
