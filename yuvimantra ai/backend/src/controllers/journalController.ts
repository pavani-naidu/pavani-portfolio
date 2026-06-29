import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Journal from '../models/Journal';
import User from '../models/User';
import { analyzeSentiment, generateJournalSummary } from '../utils/gemini';
import { isDbConnected, mockDb, mockJournals } from '../utils/dbFallback';

export const createJournal = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { title, content, tags, moodEmoji, date } = req.body;

    if (!title || !content) {
      return res.status(400).json({ error: 'Journal title and content are required' });
    }

    if (!isDbConnected()) {
      console.log('[Offline Mode] Saving diary entry and calling AI analysis...');
      const newJournal = await mockJournals.create(req.user.id, { title, content, tags, moodEmoji, date });
      
      // Award points
      const user = mockDb.users.find((u) => u._id === req.user?.id);
      if (user) user.stats.points += 15;

      return res.status(201).json(newJournal);
    }

    const journalDate = date ? new Date(date) : new Date();

    const [sentimentResult, aiSummary] = await Promise.all([
      analyzeSentiment(content),
      generateJournalSummary(content),
    ]);

    const newJournal = new Journal({
      user: req.user.id,
      title,
      content,
      tags: tags || [],
      moodEmoji: moodEmoji || '',
      sentiment: sentimentResult.sentiment,
      sentimentScore: sentimentResult.score,
      aiSummary,
      date: journalDate,
    });

    await newJournal.save();

    const userObj = await User.findById(req.user.id);
    if (userObj) {
      userObj.stats.points += 15;
      await userObj.save();
    }

    return res.status(201).json(newJournal);
  } catch (error) {
    console.error('Create journal error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getJournals = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    if (!isDbConnected()) {
      console.log('[Offline Mode] Querying diary entries...');
      const list = await mockJournals.list(req.user.id, req.query);
      return res.json(list);
    }

    const { search, tag, favorite } = req.query;
    const filter: any = { user: req.user.id };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
      ];
    }

    if (tag) {
      filter.tags = tag;
    }

    if (favorite === 'true') {
      filter.isFavorite = true;
    }

    const journals = await Journal.find(filter).sort({ date: -1 });
    return res.json(journals);
  } catch (error) {
    console.error('Get journals error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getJournalById = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    if (!isDbConnected()) {
      const journal = mockDb.journals.find((j) => j._id === req.params.id && j.user === req.user?.id);
      if (!journal) return res.status(404).json({ error: 'Journal entry not found' });
      return res.json(journal);
    }

    const journal = await Journal.findOne({ _id: req.params.id, user: req.user.id });
    if (!journal) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    return res.json(journal);
  } catch (error) {
    console.error('Get journal by ID error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const updateJournal = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { title, content, tags, moodEmoji, date, isFavorite } = req.body;

    if (!isDbConnected()) {
      console.log('[Offline Mode] Updating journal entry...');
      const updated = await mockJournals.update(req.user.id, req.params.id, { title, content, tags, moodEmoji, date, isFavorite });
      return res.json(updated);
    }

    const journal = await Journal.findOne({ _id: req.params.id, user: req.user.id });

    if (!journal) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    if (title) journal.title = title;
    if (tags) journal.tags = tags;
    if (moodEmoji !== undefined) journal.moodEmoji = moodEmoji;
    if (date) journal.date = new Date(date);
    if (isFavorite !== undefined) journal.isFavorite = isFavorite;

    if (content && content !== journal.content) {
      journal.content = content;
      const [sentimentResult, aiSummary] = await Promise.all([
        analyzeSentiment(content),
        generateJournalSummary(content),
      ]);
      journal.sentiment = sentimentResult.sentiment;
      journal.sentimentScore = sentimentResult.score;
      journal.aiSummary = aiSummary;
    }

    await journal.save();
    return res.json(journal);
  } catch (error) {
    console.error('Update journal error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const deleteJournal = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    if (!isDbConnected()) {
      console.log('[Offline Mode] Deleting journal entry...');
      const result = await mockJournals.delete(req.user.id, req.params.id);
      return res.json(result);
    }

    const journal = await Journal.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!journal) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    return res.json({ message: 'Journal entry deleted successfully' });
  } catch (error) {
    console.error('Delete journal error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const toggleFavorite = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    if (!isDbConnected()) {
      const journal = mockDb.journals.find((j) => j._id === req.params.id && j.user === req.user?.id);
      if (!journal) return res.status(404).json({ error: 'Journal entry not found' });
      journal.isFavorite = !journal.isFavorite;
      return res.json(journal);
    }

    const journal = await Journal.findOne({ _id: req.params.id, user: req.user.id });
    if (!journal) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }

    journal.isFavorite = !journal.isFavorite;
    await journal.save();

    return res.json(journal);
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
