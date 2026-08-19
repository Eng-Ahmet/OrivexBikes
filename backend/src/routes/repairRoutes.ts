import { Router } from 'express';
import { getRepairParts, getRepairServices } from '../controllers/repairController.js';

const router = Router();

router.get('/parts', getRepairParts);
router.get('/services', getRepairServices);

export default router;
