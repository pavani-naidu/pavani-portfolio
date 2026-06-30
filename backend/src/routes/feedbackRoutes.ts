import { Router } from 'express';
import { createFeedback } from '../controllers/feedbackController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Allow authenticated submissions
router.post('/', authenticateToken as any, createFeedback as any);

export default router;
