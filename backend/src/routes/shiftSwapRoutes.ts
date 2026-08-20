import { Router } from 'express';
import {
  getShiftSwapRequests,
  createShiftSwapRequest,
  respondShiftSwapRequest,
  managerReviewShiftSwapRequest
} from '../controllers/shiftSwapController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getShiftSwapRequests);
router.post('/', authenticateToken, createShiftSwapRequest);
router.post('/:id/respond', authenticateToken, respondShiftSwapRequest);
router.post('/:id/review', authenticateToken, requireAdmin, managerReviewShiftSwapRequest);

export default router;
