import { Router } from 'express';
import { logMood, getMoods, getMoodAnalytics } from '../controllers/moodController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken as any);

router.post('/', logMood as any);
router.get('/', getMoods as any);
router.get('/analytics', getMoodAnalytics as any);

export default router;
