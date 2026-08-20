import { Router } from 'express';
import { getSettings, updateSetting } from '../controllers/settingController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getSettings);
router.patch('/:key', authenticateToken, requireAdmin, updateSetting);
router.put('/:key', authenticateToken, requireAdmin, updateSetting);

export default router;

