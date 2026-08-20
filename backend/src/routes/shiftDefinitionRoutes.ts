import { Router } from 'express';
import {
  getShiftDefinitions,
  createShiftDefinition,
  getShiftAssignments,
  assignShiftToEmployee
} from '../controllers/shiftDefinitionController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticateToken, getShiftDefinitions);
router.post('/', authenticateToken, requireAdmin, createShiftDefinition);
router.get('/templates', authenticateToken, getShiftDefinitions);
router.post('/templates', authenticateToken, requireAdmin, createShiftDefinition);
router.get('/assignments', authenticateToken, getShiftAssignments);
router.post('/assignments', authenticateToken, requireAdmin, assignShiftToEmployee);

export default router;
