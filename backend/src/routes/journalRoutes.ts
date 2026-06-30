import { Router } from 'express';
import {
  createJournal,
  getJournals,
  getJournalById,
  updateJournal,
  deleteJournal,
  toggleFavorite,
} from '../controllers/journalController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken as any);

router.post('/', createJournal as any);
router.get('/', getJournals as any);
router.get('/:id', getJournalById as any);
router.put('/:id', updateJournal as any);
router.delete('/:id', deleteJournal as any);
router.put('/:id/favorite', toggleFavorite as any);

export default router;
