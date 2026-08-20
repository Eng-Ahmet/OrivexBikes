import { Router } from 'express';
import {
  getPayrollPeriods,
  createPayrollPeriod,
  getPayrollRecords,
  calculatePayrollForPeriod,
  addPayrollAdjustment,
  updatePayrollRecordStatus,
  lockPayrollPeriod
} from '../controllers/payrollController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/periods', authenticateToken, getPayrollPeriods);
router.post('/periods', authenticateToken, requireAdmin, createPayrollPeriod);
router.post('/periods/:id/calculate', authenticateToken, requireAdmin, calculatePayrollForPeriod);
router.post('/periods/:id/lock', authenticateToken, requireAdmin, lockPayrollPeriod);

router.get('/records', authenticateToken, getPayrollRecords);
router.post('/records/:id/adjustments', authenticateToken, requireAdmin, addPayrollAdjustment);
router.patch('/records/:id/status', authenticateToken, requireAdmin, updatePayrollRecordStatus);

export default router;
