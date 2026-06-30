import { Router } from 'express';
import { createTask, getTasks, updateTask, deleteTask, getPlannerStats } from '../controllers/taskController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken as any);

router.post('/', createTask as any);
router.get('/', getTasks as any);
router.get('/stats', getPlannerStats as any);
router.put('/:id', updateTask as any);
router.delete('/:id', deleteTask as any);

export default router;
