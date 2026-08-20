import { Router } from 'express';
import {
  getLeaveRequests,
  createLeaveRequest,
  reviewLeaveRequest
} from '../controllers/leaveController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getLeaveRequests);
router.post('/', authenticateToken, createLeaveRequest);
router.post('/:id/review', authenticateToken, requireAdmin, reviewLeaveRequest);

export default router;
