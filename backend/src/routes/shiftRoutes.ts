import { Router } from 'express';
import { getCurrentShift, openShift, closeShift } from '../controllers/shiftController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/current', authenticateToken, getCurrentShift);
router.post('/open', authenticateToken, openShift);
router.post('/close', authenticateToken, closeShift);

export default router;
