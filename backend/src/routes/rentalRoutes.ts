import { Router } from 'express';
import { getRentals, createRental, returnVehicle, extendRentalContract } from '../controllers/rentalController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getRentals);
router.post('/', authenticateToken, createRental);
router.post('/:id/return', authenticateToken, returnVehicle);
router.post('/:id/extend', authenticateToken, extendRentalContract);

export default router;
