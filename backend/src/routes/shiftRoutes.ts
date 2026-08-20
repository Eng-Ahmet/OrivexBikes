import { Router } from 'express';
import { getCurrentShift, openShift, closeShift, getWeeklySchedules, recordCashWithdrawal, getShiftHistory, getEmployeeStats, getPaidTransactions } from '../controllers/shiftController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/current', authenticateToken, getCurrentShift);
router.get('/employee-stats', authenticateToken, getEmployeeStats);
router.get('/paid-transactions', authenticateToken, getPaidTransactions);
router.get('/history', authenticateToken, getShiftHistory);
router.get('/schedules', authenticateToken, getWeeklySchedules);
router.post('/open', authenticateToken, openShift);
router.post('/withdrawal', authenticateToken, recordCashWithdrawal);
router.post('/close', authenticateToken, closeShift);

export default router;
