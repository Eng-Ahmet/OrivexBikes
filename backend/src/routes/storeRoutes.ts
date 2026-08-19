import { Router } from 'express';
import { getStores, updateStoreConfig, recordHistoricalCash, getHistoricalCashLogs } from '../controllers/storeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', getStores);
router.put('/:id/config', authenticateToken, updateStoreConfig);
router.post('/:id/historical-cash', authenticateToken, recordHistoricalCash);
router.get('/:id/historical-cash', authenticateToken, getHistoricalCashLogs);

export default router;
