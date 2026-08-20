import { Router } from 'express';
import { getVehicles, createVehicle, updateVehicleStatus, transferVehicle } from '../controllers/vehicleController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getVehicles);
router.post('/', authenticateToken, requireAdmin, createVehicle);
router.patch('/:id/status', authenticateToken, updateVehicleStatus);
router.post('/:id/transfer', authenticateToken, requireAdmin, transferVehicle);

export default router;

