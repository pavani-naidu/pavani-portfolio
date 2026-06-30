import { Router } from 'express';
import { getProfile, updateProfile, updateSettings, deleteAccount } from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken as any);

router.get('/profile', getProfile as any);
router.put('/profile', updateProfile as any);
router.put('/settings', updateSettings as any);
router.delete('/', deleteAccount as any);

export default router;
