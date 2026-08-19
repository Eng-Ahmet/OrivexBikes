import { Router } from 'express';
import { getCurrentShift, openShift, closeShift, getWeeklySchedules } from '../controllers/shiftController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/current', authenticateToken, getCurrentShift);
router.get('/schedules', authenticateToken, getWeeklySchedules);
router.post('/open', authenticateToken, openShift);
router.post('/close', authenticateToken, closeShift);

export default router;
