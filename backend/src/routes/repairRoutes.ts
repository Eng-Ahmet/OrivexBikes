import { Router } from 'express';
import { getRepairParts, getRepairServices, getRepairWorkOrders, createRepairWorkOrder, updateRepairWorkOrderStatus } from '../controllers/repairController.js';

const router = Router();

router.get('/', getRepairWorkOrders);
router.post('/', createRepairWorkOrder);

router.get('/parts', getRepairParts);
router.get('/services', getRepairServices);

router.get('/work-orders', getRepairWorkOrders);
router.post('/work-orders', createRepairWorkOrder);
router.put('/work-orders/:id/status', updateRepairWorkOrderStatus);

export default router;

