import { Router } from 'express';
import { getTariffs } from '../controllers/tariffController.js';

const router = Router();

router.get('/', getTariffs);

export default router;
