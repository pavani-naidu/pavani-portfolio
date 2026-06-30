import { Router } from 'express';
import {
  createChat,
  getChats,
  getChatMessages,
  sendMessage,
  pinChat,
  unpinChat,
  deleteChat,
  addReaction,
  editMessage,
  exportChat,
} from '../controllers/chatController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.use(authenticateToken as any);

router.post('/', createChat as any);
router.get('/', getChats as any);
router.get('/:chatId/messages', getChatMessages as any);
router.post('/:chatId/messages', sendMessage as any);
router.put('/:chatId/pin', pinChat as any);
router.put('/:chatId/unpin', unpinChat as any);
router.delete('/:chatId', deleteChat as any);
router.put('/messages/:messageId/react', addReaction as any);
router.put('/messages/:messageId/edit', editMessage as any);
router.get('/:chatId/export', exportChat as any);

export default router;
