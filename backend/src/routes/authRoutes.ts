import { Router } from 'express';
import { loginUser, listUsers } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', loginUser);
router.get('/users', authenticateToken, listUsers);

export default router;
