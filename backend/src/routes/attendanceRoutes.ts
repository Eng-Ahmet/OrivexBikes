import { Router } from 'express';
import {
  getAttendanceRecords,
  clockIn,
  clockOut,
  adjustAttendance
} from '../controllers/attendanceController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getAttendanceRecords);
router.post('/clock-in', authenticateToken, clockIn);
router.post('/clock-out', authenticateToken, clockOut);
router.put('/:id/adjust', authenticateToken, requireAdmin, adjustAttendance);

export default router;
