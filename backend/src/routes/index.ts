import { Router } from 'express';
import authRoutes from './authRoutes.js';
import storeRoutes from './storeRoutes.js';
import vehicleRoutes from './vehicleRoutes.js';
import rentalRoutes from './rentalRoutes.js';
import shiftRoutes from './shiftRoutes.js';
import reportRoutes from './reportRoutes.js';
import repairRoutes from './repairRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/stores', storeRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/rentals', rentalRoutes);
router.use('/shifts', shiftRoutes);
router.use('/reports', reportRoutes);
router.use('/repairs', repairRoutes);

export default router;
