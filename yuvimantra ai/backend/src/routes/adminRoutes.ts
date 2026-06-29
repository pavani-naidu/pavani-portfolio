import { Router } from 'express';
import {
  getUsers,
  getSystemStats,
  getFeedbacks,
  getAuditLogs,
} from '../controllers/adminController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

router.use(authenticateToken as any);
router.use(requireAdmin as any);

router.get('/users', getUsers as any);
router.get('/stats', getSystemStats as any);
router.get('/feedbacks', getFeedbacks as any);
router.get('/logs', getAuditLogs as any);

export default router;
