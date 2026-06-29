"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toggleFavorite = exports.deleteJournal = exports.updateJournal = exports.getJournalById = exports.getJournals = exports.createJournal = void 0;
const Journal_1 = __importDefault(require("../models/Journal"));
const User_1 = __importDefault(require("../models/User"));
const gemini_1 = require("../utils/gemini");
const dbFallback_1 = require("../utils/dbFallback");
const createJournal = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { title, content, tags, moodEmoji, date } = req.body;
        if (!title || !content) {
            return res.status(400).json({ error: 'Journal title and content are required' });
        }
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Saving diary entry and calling AI analysis...');
            const newJournal = await dbFallback_1.mockJournals.create(req.user.id, { title, content, tags, moodEmoji, date });
            // Award points
            const user = dbFallback_1.mockDb.users.find((u) => u._id === req.user?.id);
            if (user)
                user.stats.points += 15;
            return res.status(201).json(newJournal);
        }
        const journalDate = date ? new Date(date) : new Date();
        const [sentimentResult, aiSummary] = await Promise.all([
            (0, gemini_1.analyzeSentiment)(content),
            (0, gemini_1.generateJournalSummary)(content),
        ]);
        const newJournal = new Journal_1.default({
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
        const userObj = await User_1.default.findById(req.user.id);
        if (userObj) {
            userObj.stats.points += 15;
            await userObj.save();
        }
        return res.status(201).json(newJournal);
    }
    catch (error) {
        console.error('Create journal error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.createJournal = createJournal;
const getJournals = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Querying diary entries...');
            const list = await dbFallback_1.mockJournals.list(req.user.id, req.query);
            return res.json(list);
        }
        const { search, tag, favorite } = req.query;
        const filter = { user: req.user.id };
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
        const journals = await Journal_1.default.find(filter).sort({ date: -1 });
        return res.json(journals);
    }
    catch (error) {
        console.error('Get journals error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.getJournals = getJournals;
const getJournalById = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!(0, dbFallback_1.isDbConnected)()) {
            const journal = dbFallback_1.mockDb.journals.find((j) => j._id === req.params.id && j.user === req.user?.id);
            if (!journal)
                return res.status(404).json({ error: 'Journal entry not found' });
            return res.json(journal);
        }
        const journal = await Journal_1.default.findOne({ _id: req.params.id, user: req.user.id });
        if (!journal) {
            return res.status(404).json({ error: 'Journal entry not found' });
        }
        return res.json(journal);
    }
    catch (error) {
        console.error('Get journal by ID error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.getJournalById = getJournalById;
const updateJournal = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { title, content, tags, moodEmoji, date, isFavorite } = req.body;
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Updating journal entry...');
            const updated = await dbFallback_1.mockJournals.update(req.user.id, req.params.id, { title, content, tags, moodEmoji, date, isFavorite });
            return res.json(updated);
        }
        const journal = await Journal_1.default.findOne({ _id: req.params.id, user: req.user.id });
        if (!journal) {
            return res.status(404).json({ error: 'Journal entry not found' });
        }
        if (title)
            journal.title = title;
        if (tags)
            journal.tags = tags;
        if (moodEmoji !== undefined)
            journal.moodEmoji = moodEmoji;
        if (date)
            journal.date = new Date(date);
        if (isFavorite !== undefined)
            journal.isFavorite = isFavorite;
        if (content && content !== journal.content) {
            journal.content = content;
            const [sentimentResult, aiSummary] = await Promise.all([
                (0, gemini_1.analyzeSentiment)(content),
                (0, gemini_1.generateJournalSummary)(content),
            ]);
            journal.sentiment = sentimentResult.sentiment;
            journal.sentimentScore = sentimentResult.score;
            journal.aiSummary = aiSummary;
        }
        await journal.save();
        return res.json(journal);
    }
    catch (error) {
        console.error('Update journal error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.updateJournal = updateJournal;
const deleteJournal = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Deleting journal entry...');
            const result = await dbFallback_1.mockJournals.delete(req.user.id, req.params.id);
            return res.json(result);
        }
        const journal = await Journal_1.default.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!journal) {
            return res.status(404).json({ error: 'Journal entry not found' });
        }
        return res.json({ message: 'Journal entry deleted successfully' });
    }
    catch (error) {
        console.error('Delete journal error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.deleteJournal = deleteJournal;
const toggleFavorite = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!(0, dbFallback_1.isDbConnected)()) {
            const journal = dbFallback_1.mockDb.journals.find((j) => j._id === req.params.id && j.user === req.user?.id);
            if (!journal)
                return res.status(404).json({ error: 'Journal entry not found' });
            journal.isFavorite = !journal.isFavorite;
            return res.json(journal);
        }
        const journal = await Journal_1.default.findOne({ _id: req.params.id, user: req.user.id });
        if (!journal) {
            return res.status(404).json({ error: 'Journal entry not found' });
        }
        journal.isFavorite = !journal.isFavorite;
        await journal.save();
        return res.json(journal);
    }
    catch (error) {
        console.error('Toggle favorite error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.toggleFavorite = toggleFavorite;
