"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFeedback = void 0;
const Feedback_1 = __importDefault(require("../models/Feedback"));
const User_1 = __importDefault(require("../models/User"));
const dbFallback_1 = require("../utils/dbFallback");
const createFeedback = async (req, res) => {
    try {
        const { rating, comment, category } = req.body;
        if (!rating || !comment) {
            return res.status(400).json({ error: 'Rating (1-5) and comment text are required' });
        }
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Submitting review feedback...');
            const newFeedback = {
                _id: 'mock_fb_' + Math.random().toString(36).substring(2, 9),
                user: req.user?.id || undefined,
                rating,
                comment,
                category: category || 'other',
                createdAt: new Date(),
            };
            dbFallback_1.mockDb.feedbacks.push(newFeedback);
            if (req.user) {
                const user = dbFallback_1.mockDb.users.find((u) => u._id === req.user?.id);
                if (user)
                    user.stats.points += 10;
            }
            return res.status(201).json(newFeedback);
        }
        const newFeedback = new Feedback_1.default({
            user: req.user?.id || undefined,
            rating,
            comment,
            category: category || 'other',
        });
        await newFeedback.save();
        if (req.user) {
            const user = await User_1.default.findById(req.user.id);
            if (user) {
                user.stats.points += 10;
                await user.save();
            }
        }
        return res.status(201).json(newFeedback);
    }
    catch (error) {
        console.error('Create feedback error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.createFeedback = createFeedback;
