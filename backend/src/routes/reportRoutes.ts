import { Router } from 'express';
import { getDashboardReport, getDailyReport, getMonthlyReport } from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getDashboardReport);
router.get('/dashboard', authenticateToken, getDashboardReport);
router.get('/daily', authenticateToken, getDailyReport);
router.get('/monthly', authenticateToken, getMonthlyReport);

export default router;

