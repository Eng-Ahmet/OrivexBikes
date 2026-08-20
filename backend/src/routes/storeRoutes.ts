import { Router } from 'express';
import {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  setStoreStatus,
  deleteStore,
  getStorePnl
} from '../controllers/storeController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getStores);
router.get('/pnl', authenticateToken, getStorePnl);
router.get('/:id', authenticateToken, getStoreById);
router.get('/:id/pnl', authenticateToken, getStorePnl);
router.post('/', authenticateToken, requireAdmin, createStore);
router.put('/:id', authenticateToken, requireAdmin, updateStore);
router.patch('/:id/status', authenticateToken, requireAdmin, setStoreStatus);
router.delete('/:id', authenticateToken, requireAdmin, deleteStore);

export default router;

