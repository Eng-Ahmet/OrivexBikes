import { Router } from 'express';
import {
  getExpenses,
  createExpense,
  voidExpense
} from '../controllers/expenseController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getExpenses);
router.post('/', authenticateToken, requireAdmin, createExpense);
router.post('/:id/void', authenticateToken, requireAdmin, voidExpense);

export default router;
