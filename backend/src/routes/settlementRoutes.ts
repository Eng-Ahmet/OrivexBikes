import { Router } from 'express';
import { getSettlements, paySettlement } from '../controllers/settlementController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getSettlements);
router.post('/:id/pay', authenticateToken, paySettlement);

export default router;
