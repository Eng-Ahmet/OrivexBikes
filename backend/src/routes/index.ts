import { Router } from 'express';
import authRoutes from './authRoutes.js';
import storeRoutes from './storeRoutes.js';
import vehicleRoutes from './vehicleRoutes.js';
import rentalRoutes from './rentalRoutes.js';
import shiftRoutes from './shiftRoutes.js';
import reportRoutes from './reportRoutes.js';
import repairRoutes from './repairRoutes.js';
import settlementRoutes from './settlementRoutes.js';
import settingRoutes from './settingRoutes.js';
import tariffRoutes from './tariffRoutes.js';
import publicRoutes from './publicRoutes.js';

const router = Router();

router.use('/auth', authRoutes);
router.use('/stores', storeRoutes);
router.use('/vehicles', vehicleRoutes);
router.use('/rentals', rentalRoutes);
router.use('/shifts', shiftRoutes);
router.use('/reports', reportRoutes);
router.use('/repairs', repairRoutes);
router.use('/settlements', settlementRoutes);
router.use('/settings', settingRoutes);
router.use('/tariffs', tariffRoutes);
router.use('/public', publicRoutes);

export default router;
