"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMoodAnalytics = exports.getMoods = exports.logMood = void 0;
const Mood_1 = __importDefault(require("../models/Mood"));
const User_1 = __importDefault(require("../models/User"));
const dbFallback_1 = require("../utils/dbFallback");
const logMood = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { mood, value, emoji, note, tags, date } = req.body;
        if (!mood || !value || !emoji) {
            return res.status(400).json({ error: 'Mood name, value (1-5), and emoji are required' });
        }
        const logDate = date ? new Date(date) : new Date();
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Logging mood check-in...');
            const newMood = {
                _id: 'mock_mood_' + Math.random().toString(36).substring(2, 9),
                user: req.user.id,
                mood,
                value,
                emoji,
                note: note || '',
                tags: tags || [],
                date: logDate,
                createdAt: new Date(),
            };
            dbFallback_1.mockDb.moods.push(newMood);
            // Award points
            const user = dbFallback_1.mockDb.users.find((u) => u._id === req.user?.id);
            if (user) {
                user.stats.points += 5;
            }
            return res.status(201).json(newMood);
        }
        const newMood = new Mood_1.default({
            user: req.user.id,
            mood,
            value,
            emoji,
            note,
            tags,
            date: logDate,
        });
        await newMood.save();
        const userObj = await User_1.default.findById(req.user.id);
        if (userObj) {
            userObj.stats.points += 5;
            await userObj.save();
        }
        return res.status(201).json(newMood);
    }
    catch (error) {
        console.error('Log mood error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.logMood = logMood;
const getMoods = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Fetching mood logs...');
            const list = dbFallback_1.mockDb.moods
                .filter((m) => m.user === req.user?.id)
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return res.json(list);
        }
        const { limit, days } = req.query;
        const filter = { user: req.user.id };
        if (days) {
            const cutOffDate = new Date();
            cutOffDate.setDate(cutOffDate.getDate() - Number(days));
            filter.date = { $gte: cutOffDate };
        }
        const query = Mood_1.default.find(filter).sort({ date: -1 });
        if (limit) {
            query.limit(Number(limit));
        }
        const moods = await query.exec();
        return res.json(moods);
    }
    catch (error) {
        console.error('Get moods error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.getMoods = getMoods;
const getMoodAnalytics = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Compiling mood analytics...');
            const userMoods = dbFallback_1.mockDb.moods.filter((m) => m.user === req.user?.id);
            const totalEntries = userMoods.length;
            if (totalEntries === 0) {
                return res.json({
                    totalEntries: 0,
                    averageScore: 0,
                    distribution: {},
                    recentTrends: [],
                    commonTags: [],
                    insight: 'Log your first mood in local mode to unlock insights!',
                });
            }
            let totalScore = 0;
            const distribution = {};
            const tagsMap = {};
            userMoods.forEach((m) => {
                totalScore += m.value;
                distribution[m.mood] = (distribution[m.mood] || 0) + 1;
                if (m.tags) {
                    m.tags.forEach((t) => {
                        tagsMap[t] = (tagsMap[t] || 0) + 1;
                    });
                }
            });
            const averageScore = Number((totalScore / totalEntries).toFixed(2));
            const commonTags = Object.entries(tagsMap)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 5);
            const recentTrends = userMoods.map((m) => ({
                date: new Date(m.date).toISOString().split('T')[0],
                value: m.value,
                mood: m.mood,
                emoji: m.emoji,
            }));
            return res.json({
                totalEntries,
                averageScore,
                distribution,
                recentTrends,
                commonTags,
                insight: 'Your local mood trends look stable. Keep checking in!',
            });
        }
        const { days = '30' } = req.query;
        const cutOffDate = new Date();
        cutOffDate.setDate(cutOffDate.getDate() - Number(days));
        const moods = await Mood_1.default.find({
            user: req.user.id,
            date: { $gte: cutOffDate },
        }).sort({ date: 1 });
        const totalEntries = moods.length;
        if (totalEntries === 0) {
            return res.json({
                totalEntries: 0,
                averageScore: 0,
                distribution: {},
                recentTrends: [],
                commonTags: [],
            });
        }
        let totalScore = 0;
        const distribution = {};
        const tagsMap = {};
        moods.forEach((m) => {
            totalScore += m.value;
            distribution[m.mood] = (distribution[m.mood] || 0) + 1;
            if (m.tags) {
                m.tags.forEach((t) => {
                    tagsMap[t] = (tagsMap[t] || 0) + 1;
                });
            }
        });
        const averageScore = Number((totalScore / totalEntries).toFixed(2));
        const commonTags = Object.entries(tagsMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
        const recentTrends = moods.map((m) => ({
            date: m.date.toISOString().split('T')[0],
            value: m.value,
            mood: m.mood,
            emoji: m.emoji,
        }));
        let insight = 'Your emotional trends are relatively stable. Keep reflecting on your daily experiences.';
        if (averageScore >= 4) {
            insight = 'You have been feeling great lately! Take note of the habits or activities that are contributing to your positive state.';
        }
        else if (averageScore <= 2.5) {
            insight = 'It looks like you have been facing some challenging days. Remember that it is okay to feel down.';
        }
        return res.json({
            totalEntries,
            averageScore,
            distribution,
            recentTrends,
            commonTags,
            insight,
        });
    }
    catch (error) {
        console.error('Get mood analytics error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.getMoodAnalytics = getMoodAnalytics;
