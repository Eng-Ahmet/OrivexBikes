import { Router } from 'express';
import {
  getEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  setEmployeeStatus,
  transferEmployee
} from '../controllers/employeeController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getEmployees);
router.get('/:id', authenticateToken, getEmployeeById);
router.post('/', authenticateToken, requireAdmin, createEmployee);
router.put('/:id', authenticateToken, requireAdmin, updateEmployee);
router.patch('/:id/status', authenticateToken, requireAdmin, setEmployeeStatus);
router.post('/:id/transfer', authenticateToken, requireAdmin, transferEmployee);

export default router;

