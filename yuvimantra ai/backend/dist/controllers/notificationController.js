"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const Notification_1 = __importDefault(require("../models/Notification"));
const dbFallback_1 = require("../utils/dbFallback");
const getNotifications = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Retrieving user notification logs...');
            const list = dbFallback_1.mockDb.notifications
                .filter((n) => n.user === req.user?.id)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            return res.json(list);
        }
        const notifications = await Notification_1.default.find({ user: req.user.id })
            .sort({ createdAt: -1 })
            .limit(50);
        return res.json(notifications);
    }
    catch (error) {
        console.error('Get notifications error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.getNotifications = getNotifications;
const markAsRead = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!(0, dbFallback_1.isDbConnected)()) {
            const notif = dbFallback_1.mockDb.notifications.find((n) => n._id === req.params.id && n.user === req.user?.id);
            if (notif)
                notif.isRead = true;
            return res.json({ message: 'Notification marked as read' });
        }
        await Notification_1.default.updateMany({ user: req.user.id, _id: req.params.id }, { isRead: true });
        return res.json({ message: 'Notification marked as read' });
    }
    catch (error) {
        console.error('Mark notification as read error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.markAsRead = markAsRead;
const markAllAsRead = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!(0, dbFallback_1.isDbConnected)()) {
            dbFallback_1.mockDb.notifications.forEach((n) => {
                if (n.user === req.user?.id)
                    n.isRead = true;
            });
            return res.json({ message: 'All notifications marked as read' });
        }
        await Notification_1.default.updateMany({ user: req.user.id, isRead: false }, { isRead: true });
        return res.json({ message: 'All notifications marked as read' });
    }
    catch (error) {
        console.error('Mark all notifications as read error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.markAllAsRead = markAllAsRead;
const deleteNotification = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!(0, dbFallback_1.isDbConnected)()) {
            dbFallback_1.mockDb.notifications = dbFallback_1.mockDb.notifications.filter((n) => !(n._id === req.params.id && n.user === req.user?.id));
            return res.json({ message: 'Notification deleted' });
        }
        await Notification_1.default.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        return res.json({ message: 'Notification deleted' });
    }
    catch (error) {
        console.error('Delete notification error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.deleteNotification = deleteNotification;
