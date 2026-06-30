import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Notification from '../models/Notification';
import { isDbConnected, mockDb } from '../utils/dbFallback';

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    if (!isDbConnected()) {
      console.log('[Offline Mode] Retrieving user notification logs...');
      const list = mockDb.notifications
        .filter((n) => n.user === req.user?.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return res.json(list);
    }

    const notifications = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);

    return res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    if (!isDbConnected()) {
      const notif = mockDb.notifications.find((n) => n._id === req.params.id && n.user === req.user?.id);
      if (notif) notif.isRead = true;
      return res.json({ message: 'Notification marked as read' });
    }

    await Notification.updateMany(
      { user: req.user.id, _id: req.params.id },
      { isRead: true }
    );

    return res.json({ message: 'Notification marked as read' });
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    if (!isDbConnected()) {
      mockDb.notifications.forEach((n) => {
        if (n.user === req.user?.id) n.isRead = true;
      });
      return res.json({ message: 'All notifications marked as read' });
    }

    await Notification.updateMany({ user: req.user.id, isRead: false }, { isRead: true });

    return res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications as read error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    if (!isDbConnected()) {
      mockDb.notifications = mockDb.notifications.filter(
        (n) => !(n._id === req.params.id && n.user === req.user?.id)
      );
      return res.json({ message: 'Notification deleted' });
    }

    await Notification.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    return res.json({ message: 'Notification deleted' });
  } catch (error) {
    console.error('Delete notification error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
