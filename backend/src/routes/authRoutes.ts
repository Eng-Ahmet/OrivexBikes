import { Router } from 'express';
import { loginUser, listUsers, verifyPin, getMe } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/login', loginUser);
router.post('/verify-pin', verifyPin);
router.get('/me', authenticateToken, getMe);
router.get('/users', authenticateToken, listUsers);

export default router;

