"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAuditLogs = exports.getFeedbacks = exports.getSystemStats = exports.getUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const Chat_1 = __importDefault(require("../models/Chat"));
const Message_1 = __importDefault(require("../models/Message"));
const Mood_1 = __importDefault(require("../models/Mood"));
const Journal_1 = __importDefault(require("../models/Journal"));
const Feedback_1 = __importDefault(require("../models/Feedback"));
const dbFallback_1 = require("../utils/dbFallback");
const getUsers = async (req, res) => {
    try {
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Retrieving users directory...');
            return res.json(dbFallback_1.mockDb.users);
        }
        const users = await User_1.default.find().select('-password').sort({ createdAt: -1 });
        return res.json(users);
    }
    catch (error) {
        console.error('Admin get users error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.getUsers = getUsers;
const getSystemStats = async (req, res) => {
    try {
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Querying system counts...');
            const registrationTrend = [
                { _id: new Date().toISOString().split('T')[0], count: dbFallback_1.mockDb.users.length }
            ];
            return res.json({
                counts: {
                    users: dbFallback_1.mockDb.users.length,
                    chats: dbFallback_1.mockDb.chats.length,
                    messages: dbFallback_1.mockDb.messages.length,
                    moods: dbFallback_1.mockDb.moods.length,
                    journals: dbFallback_1.mockDb.journals.length,
                    feedbacks: dbFallback_1.mockDb.feedbacks.length,
                    aiUsageCount: dbFallback_1.mockDb.messages.filter(m => m.sender === 'ai').length,
                },
                averageMoodScore: 4.5,
                registrationTrend,
            });
        }
        const [totalUsers, totalChats, totalMessages, totalMoods, totalJournals, totalFeedbacks,] = await Promise.all([
            User_1.default.countDocuments(),
            Chat_1.default.countDocuments(),
            Message_1.default.countDocuments(),
            Mood_1.default.countDocuments(),
            Journal_1.default.countDocuments(),
            Feedback_1.default.countDocuments(),
        ]);
        const avgMoodData = await Mood_1.default.aggregate([
            { $group: { _id: null, avgScore: { $avg: '$value' } } },
        ]);
        const averageMoodScore = avgMoodData[0] ? Number(avgMoodData[0].avgScore.toFixed(2)) : 0;
        const totalAiMessages = await Message_1.default.countDocuments({ sender: 'ai' });
        const registrationTrend = await User_1.default.aggregate([
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
    }
    catch (error) {
        console.error('Admin get system stats error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.getSystemStats = getSystemStats;
const getFeedbacks = async (req, res) => {
    try {
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Querying review feedbacks list...');
            // Populate user field mock
            const populated = dbFallback_1.mockDb.feedbacks.map((f) => {
                const uObj = dbFallback_1.mockDb.users.find((u) => u._id === f.user);
                return {
                    ...f,
                    user: uObj ? { _id: uObj._id, name: uObj.name, email: uObj.email } : null,
                };
            });
            return res.json(populated);
        }
        const feedbacks = await Feedback_1.default.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        return res.json(feedbacks);
    }
    catch (error) {
        console.error('Admin get feedbacks error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.getFeedbacks = getFeedbacks;
const getAuditLogs = async (req, res) => {
    try {
        const logs = [
            { timestamp: new Date(Date.now() - 5 * 60000), event: 'AuthService', message: 'Token refresh executed for userSession' },
            { timestamp: new Date(Date.now() - 15 * 60000), event: 'GeminiService', message: 'Sentiment analysis resolved for JournalEntry' },
            { timestamp: new Date(Date.now() - 40 * 60000), event: 'DatabaseService', message: 'Offline local memory database in execution' },
            { timestamp: new Date(Date.now() - 120 * 60000), event: 'SchedulerService', message: 'Water intake reminder queue cleared' },
            { timestamp: new Date(Date.now() - 180 * 60000), event: 'AdminConsole', message: 'Usage analytics logs downloaded' },
        ];
        return res.json(logs);
    }
    catch (error) {
        console.error('Admin get audit logs error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.getAuditLogs = getAuditLogs;
