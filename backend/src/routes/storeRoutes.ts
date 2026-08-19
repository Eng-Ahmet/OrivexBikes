import { Router } from 'express';
import { getStores } from '../controllers/storeController.js';

const router = Router();

router.get('/', getStores);

export default router;
