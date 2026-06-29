"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAccount = exports.updateSettings = exports.updateProfile = exports.getProfile = void 0;
const User_1 = __importDefault(require("../models/User"));
const dbFallback_1 = require("../utils/dbFallback");
const getProfile = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Fetching user profile...');
            const user = dbFallback_1.mockDb.users.find((u) => u._id === req.user?.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            return res.json(user);
        }
        const user = await User_1.default.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json(user);
    }
    catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { name, bio, avatar } = req.body;
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Updating user profile...');
            const user = dbFallback_1.mockDb.users.find((u) => u._id === req.user?.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            if (name)
                user.name = name;
            if (bio !== undefined)
                user.bio = bio;
            if (avatar !== undefined)
                user.avatar = avatar;
            return res.json({ message: 'Profile updated successfully', user });
        }
        const user = await User_1.default.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (name)
            user.name = name;
        if (bio !== undefined)
            user.bio = bio;
        if (avatar !== undefined)
            user.avatar = avatar;
        await user.save();
        return res.json({
            message: 'Profile updated successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                bio: user.bio,
                avatar: user.avatar,
                settings: user.settings,
                stats: user.stats,
                achievements: user.achievements,
            },
        });
    }
    catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.updateProfile = updateProfile;
const updateSettings = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { theme, language, privacy, notifications } = req.body;
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Saving user settings...');
            const user = dbFallback_1.mockDb.users.find((u) => u._id === req.user?.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            if (theme)
                user.settings.theme = theme;
            if (language)
                user.settings.language = language;
            if (privacy)
                user.settings.privacy = { ...user.settings.privacy, ...privacy };
            if (notifications) {
                user.settings.notifications = { ...user.settings.notifications, ...notifications };
            }
            return res.json({ message: 'Settings updated successfully', settings: user.settings });
        }
        const user = await User_1.default.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        if (theme)
            user.settings.theme = theme;
        if (language)
            user.settings.language = language;
        if (privacy)
            user.settings.privacy = { ...user.settings.privacy, ...privacy };
        if (notifications) {
            user.settings.notifications = { ...user.settings.notifications, ...notifications };
        }
        await user.save();
        return res.json({
            message: 'Settings updated successfully',
            settings: user.settings,
        });
    }
    catch (error) {
        console.error('Update settings error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.updateSettings = updateSettings;
const deleteAccount = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Deleting user account...');
            dbFallback_1.mockDb.users = dbFallback_1.mockDb.users.filter((u) => u._id !== req.user?.id);
            return res.json({ message: 'Account deleted successfully' });
        }
        const user = await User_1.default.findByIdAndDelete(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json({ message: 'Account deleted successfully' });
    }
    catch (error) {
        console.error('Delete account error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.deleteAccount = deleteAccount;
