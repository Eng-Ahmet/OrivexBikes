import { Router } from 'express';
import { getStores, createStore, updateStore, deleteStore, updateStoreConfig, recordHistoricalCash, getHistoricalCashLogs } from '../controllers/storeController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', getStores);
router.post('/', authenticateToken, requireAdmin, createStore);
router.put('/:id', authenticateToken, requireAdmin, updateStore);
router.delete('/:id', authenticateToken, requireAdmin, deleteStore);
router.put('/:id/config', authenticateToken, updateStoreConfig);
router.post('/:id/historical-cash', authenticateToken, recordHistoricalCash);
router.get('/:id/historical-cash', authenticateToken, getHistoricalCashLogs);

export default router;
