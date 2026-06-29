import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Feedback from '../models/Feedback';
import User from '../models/User';
import { isDbConnected, mockDb } from '../utils/dbFallback';

export const createFeedback = async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment, category } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ error: 'Rating (1-5) and comment text are required' });
    }

    if (!isDbConnected()) {
      console.log('[Offline Mode] Submitting review feedback...');
      const newFeedback = {
        _id: 'mock_fb_' + Math.random().toString(36).substring(2, 9),
        user: req.user?.id || undefined,
        rating,
        comment,
        category: category || 'other',
        createdAt: new Date(),
      };
      mockDb.feedbacks.push(newFeedback);

      if (req.user) {
        const user = mockDb.users.find((u) => u._id === req.user?.id);
        if (user) user.stats.points += 10;
      }

      return res.status(201).json(newFeedback);
    }

    const newFeedback = new Feedback({
      user: req.user?.id || undefined,
      rating,
      comment,
      category: category || 'other',
    });

    await newFeedback.save();

    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.stats.points += 10;
        await user.save();
      }
    }

    return res.status(201).json(newFeedback);
  } catch (error) {
    console.error('Create feedback error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
