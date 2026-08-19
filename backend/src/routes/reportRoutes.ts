import { Router } from 'express';
import { getDashboardReport } from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/dashboard', authenticateToken, getDashboardReport);

export default router;
