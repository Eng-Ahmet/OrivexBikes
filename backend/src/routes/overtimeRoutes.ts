import { Router } from 'express';
import {
  getOvertimeRecords,
  reviewOvertime
} from '../controllers/overtimeController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getOvertimeRecords);
router.post('/:id/review', authenticateToken, requireAdmin, reviewOvertime);

export default router;
