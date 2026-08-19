import { Router } from 'express';
import { getRentals, createRental, returnVehicle } from '../controllers/rentalController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getRentals);
router.post('/', authenticateToken, createRental);
router.post('/:id/return', authenticateToken, returnVehicle);

export default router;
