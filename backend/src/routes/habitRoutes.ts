import { Router } from 'express';
import {
  createHabit,
  getHabits,
  completeHabit,
  uncompleteHabit,
  deleteHabit,
} from '../controllers/habitController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken as any);

router.post('/', createHabit as any);
router.get('/', getHabits as any);
router.put('/:habitId/complete', completeHabit as any);
router.put('/:habitId/uncomplete', uncompleteHabit as any);
router.delete('/:habitId', deleteHabit as any);

export default router;
