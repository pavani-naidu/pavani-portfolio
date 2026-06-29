import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Chat from '../models/Chat';
import Message from '../models/Message';
import Mood from '../models/Mood';
import Journal from '../models/Journal';
import Feedback from '../models/Feedback';
import { isDbConnected, mockDb } from '../utils/dbFallback';

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    if (!isDbConnected()) {
      console.log('[Offline Mode] Retrieving users directory...');
      return res.json(mockDb.users);
    }

    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return res.json(users);
  } catch (error) {
    console.error('Admin get users error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getSystemStats = async (req: AuthRequest, res: Response) => {
  try {
    if (!isDbConnected()) {
      console.log('[Offline Mode] Querying system counts...');
      const registrationTrend = [
        { _id: new Date().toISOString().split('T')[0], count: mockDb.users.length }
      ];
      return res.json({
        counts: {
          users: mockDb.users.length,
          chats: mockDb.chats.length,
          messages: mockDb.messages.length,
          moods: mockDb.moods.length,
          journals: mockDb.journals.length,
          feedbacks: mockDb.feedbacks.length,
          aiUsageCount: mockDb.messages.filter(m => m.sender === 'ai').length,
        },
        averageMoodScore: 4.5,
        registrationTrend,
      });
    }

    const [
      totalUsers,
      totalChats,
      totalMessages,
      totalMoods,
      totalJournals,
      totalFeedbacks,
    ] = await Promise.all([
      User.countDocuments(),
      Chat.countDocuments(),
      Message.countDocuments(),
      Mood.countDocuments(),
      Journal.countDocuments(),
      Feedback.countDocuments(),
    ]);

    const avgMoodData = await Mood.aggregate([
      { $group: { _id: null, avgScore: { $avg: '$value' } } },
    ]);
    const averageMoodScore = avgMoodData[0] ? Number(avgMoodData[0].avgScore.toFixed(2)) : 0;
    const totalAiMessages = await Message.countDocuments({ sender: 'ai' });

    const registrationTrend = await User.aggregate([
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $limit: 7 },
    ]);

    return res.json({
      counts: {
        users: totalUsers,
        chats: totalChats,
        messages: totalMessages,
        moods: totalMoods,
        journals: totalJournals,
        feedbacks: totalFeedbacks,
        aiUsageCount: totalAiMessages,
      },
      averageMoodScore,
      registrationTrend,
    });
  } catch (error) {
    console.error('Admin get system stats error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getFeedbacks = async (req: AuthRequest, res: Response) => {
  try {
    if (!isDbConnected()) {
      console.log('[Offline Mode] Querying review feedbacks list...');
      // Populate user field mock
      const populated = mockDb.feedbacks.map((f) => {
        const uObj = mockDb.users.find((u) => u._id === f.user);
        return {
          ...f,
          user: uObj ? { _id: uObj._id, name: uObj.name, email: uObj.email } : null,
        };
      });
      return res.json(populated);
    }

    const feedbacks = await Feedback.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 });
    return res.json(feedbacks);
  } catch (error) {
    console.error('Admin get feedbacks error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getAuditLogs = async (req: AuthRequest, res: Response) => {
  try {
    const logs = [
      { timestamp: new Date(Date.now() - 5 * 60000), event: 'AuthService', message: 'Token refresh executed for userSession' },
      { timestamp: new Date(Date.now() - 15 * 60000), event: 'GeminiService', message: 'Sentiment analysis resolved for JournalEntry' },
      { timestamp: new Date(Date.now() - 40 * 60000), event: 'DatabaseService', message: 'Offline local memory database in execution' },
      { timestamp: new Date(Date.now() - 120 * 60000), event: 'SchedulerService', message: 'Water intake reminder queue cleared' },
      { timestamp: new Date(Date.now() - 180 * 60000), event: 'AdminConsole', message: 'Usage analytics logs downloaded' },
    ];
    return res.json(logs);
  } catch (error) {
    console.error('Admin get audit logs error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
