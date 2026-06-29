"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportChat = exports.editMessage = exports.addReaction = exports.deleteChat = exports.unpinChat = exports.pinChat = exports.sendMessage = exports.getChatMessages = exports.getChats = exports.createChat = void 0;
const Chat_1 = __importDefault(require("../models/Chat"));
const Message_1 = __importDefault(require("../models/Message"));
const User_1 = __importDefault(require("../models/User"));
const gemini_1 = require("../utils/gemini");
const dbFallback_1 = require("../utils/dbFallback");
const createChat = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Creating new chat session...');
            const newChat = {
                _id: 'mock_chat_' + Math.random().toString(36).substring(2, 9),
                user: req.user.id,
                title: req.body.title || 'New Conversation',
                isPinned: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            dbFallback_1.mockDb.chats.push(newChat);
            return res.status(201).json(newChat);
        }
        const newChat = new Chat_1.default({
            user: req.user.id,
            title: req.body.title || 'New Conversation',
        });
        await newChat.save();
        return res.status(201).json(newChat);
    }
    catch (error) {
        console.error('Create chat error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.createChat = createChat;
const getChats = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Retrieving chats...');
            const userChats = dbFallback_1.mockDb.chats
                .filter((c) => c.user === req.user?.id)
                .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            return res.json(userChats);
        }
        const chats = await Chat_1.default.find({ user: req.user.id }).sort({ isPinned: -1, updatedAt: -1 });
        return res.json(chats);
    }
    catch (error) {
        console.error('Get chats error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.getChats = getChats;
const getChatMessages = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { chatId } = req.params;
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Retrieving chat messages...');
            const chatMsgs = dbFallback_1.mockDb.messages.filter((m) => m.chat === chatId);
            return res.json(chatMsgs);
        }
        const chat = await Chat_1.default.findOne({ _id: chatId, user: req.user.id });
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }
        const messages = await Message_1.default.find({ chat: chatId }).sort({ createdAt: 1 });
        return res.json(messages);
    }
    catch (error) {
        console.error('Get chat messages error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.getChatMessages = getChatMessages;
const sendMessage = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { chatId } = req.params;
        const { text, voiceUrl } = req.body;
        if (!text) {
            return res.status(400).json({ error: 'Message text is required' });
        }
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Processing prompt and streaming response...');
            const chat = dbFallback_1.mockDb.chats.find((c) => c._id === chatId);
            if (!chat)
                return res.status(404).json({ error: 'Chat not found' });
            // Update title on first message
            const msgCount = dbFallback_1.mockDb.messages.filter((m) => m.chat === chatId).length;
            if (msgCount === 0) {
                chat.title = text.length > 30 ? text.substring(0, 30) + '...' : text;
            }
            const userMsg = {
                _id: 'mock_msg_' + Math.random().toString(36).substring(2, 9),
                chat: chatId,
                sender: 'user',
                text,
                voiceUrl,
                reactions: [],
                isEdited: false,
                isRegenerated: false,
                createdAt: new Date(),
            };
            dbFallback_1.mockDb.messages.push(userMsg);
            // Call Gemini model
            const aiResponseText = await (0, gemini_1.generateChatResponse)([], text);
            const suggestions = text.toLowerCase().includes('stress')
                ? ['Can you guide me through breathing?', 'What are some stress relievers?']
                : ['Tell me a motivational quote.', 'How does Pomodoro work?', 'Thanks!'];
            const aiMsg = {
                _id: 'mock_msg_' + Math.random().toString(36).substring(2, 9),
                chat: chatId,
                sender: 'ai',
                text: aiResponseText,
                suggestions,
                reactions: [],
                isEdited: false,
                isRegenerated: false,
                createdAt: new Date(),
            };
            dbFallback_1.mockDb.messages.push(aiMsg);
            chat.updatedAt = new Date();
            return res.status(201).json({ userMessage: userMsg, aiMessage: aiMsg });
        }
        const chat = await Chat_1.default.findOne({ _id: chatId, user: req.user.id });
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }
        const messageCount = await Message_1.default.countDocuments({ chat: chatId });
        if (messageCount === 0) {
            chat.title = text.length > 30 ? text.substring(0, 30) + '...' : text;
            await chat.save();
        }
        const userMsg = new Message_1.default({
            chat: chatId,
            sender: 'user',
            text,
            voiceUrl,
        });
        await userMsg.save();
        const historyMsgs = await Message_1.default.find({ chat: chatId }).sort({ createdAt: -1 }).limit(21);
        const pastMsgs = historyMsgs.reverse().filter((m) => m._id.toString() !== userMsg._id.toString());
        const history = pastMsgs.map((m) => ({
            role: m.sender === 'user' ? 'user' : 'model',
            parts: m.text,
        }));
        const aiResponseText = await (0, gemini_1.generateChatResponse)(history, text);
        const suggestions = [];
        const lowerResponse = aiResponseText.toLowerCase();
        if (lowerResponse.includes('stress') || lowerResponse.includes('anxious') || lowerResponse.includes('breath')) {
            suggestions.push('Can you guide me through a breathing exercise?', 'What are some fast stress relievers?');
        }
        else if (lowerResponse.includes('study') || lowerResponse.includes('exam') || lowerResponse.includes('focus')) {
            suggestions.push('How does the Pomodoro technique work?', 'Help me make a revision plan.');
        }
        else {
            suggestions.push('Tell me a motivational quote.', 'How can I build healthy habits?', 'Thanks, that helps!');
        }
        const aiMsg = new Message_1.default({
            chat: chatId,
            sender: 'ai',
            text: aiResponseText,
            suggestions,
        });
        await aiMsg.save();
        const userObj = await User_1.default.findById(req.user.id);
        if (userObj) {
            userObj.stats.points += 2;
            await userObj.save();
        }
        chat.updatedAt = new Date();
        await chat.save();
        return res.status(201).json({ userMessage: userMsg, aiMessage: aiMsg });
    }
    catch (error) {
        console.error('Send message error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.sendMessage = sendMessage;
const pinChat = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!(0, dbFallback_1.isDbConnected)()) {
            const chat = dbFallback_1.mockDb.chats.find((c) => c._id === req.params.chatId);
            if (!chat)
                return res.status(404).json({ error: 'Chat not found' });
            chat.isPinned = true;
            return res.json(chat);
        }
        const chat = await Chat_1.default.findOneAndUpdate({ _id: req.params.chatId, user: req.user.id }, { isPinned: true }, { new: true });
        if (!chat)
            return res.status(404).json({ error: 'Chat not found' });
        return res.json(chat);
    }
    catch (error) {
        console.error('Pin chat error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.pinChat = pinChat;
const unpinChat = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!(0, dbFallback_1.isDbConnected)()) {
            const chat = dbFallback_1.mockDb.chats.find((c) => c._id === req.params.chatId);
            if (!chat)
                return res.status(404).json({ error: 'Chat not found' });
            chat.isPinned = false;
            return res.json(chat);
        }
        const chat = await Chat_1.default.findOneAndUpdate({ _id: req.params.chatId, user: req.user.id }, { isPinned: false }, { new: true });
        if (!chat)
            return res.status(404).json({ error: 'Chat not found' });
        return res.json(chat);
    }
    catch (error) {
        console.error('Unpin chat error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.unpinChat = unpinChat;
const deleteChat = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!(0, dbFallback_1.isDbConnected)()) {
            dbFallback_1.mockDb.chats = dbFallback_1.mockDb.chats.filter((c) => c._id !== req.params.chatId);
            dbFallback_1.mockDb.messages = dbFallback_1.mockDb.messages.filter((m) => m.chat !== req.params.chatId);
            return res.json({ message: 'Conversation deleted successfully' });
        }
        const chat = await Chat_1.default.findOneAndDelete({ _id: req.params.chatId, user: req.user.id });
        if (!chat)
            return res.status(404).json({ error: 'Chat not found' });
        await Message_1.default.deleteMany({ chat: req.params.chatId });
        return res.json({ message: 'Conversation deleted successfully' });
    }
    catch (error) {
        console.error('Delete chat error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.deleteChat = deleteChat;
const addReaction = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { messageId } = req.params;
        const { emoji } = req.body;
        if (!emoji)
            return res.status(400).json({ error: 'Emoji is required' });
        if (!(0, dbFallback_1.isDbConnected)()) {
            const msg = dbFallback_1.mockDb.messages.find((m) => m._id === messageId);
            if (!msg)
                return res.status(404).json({ error: 'Message not found' });
            msg.reactions = msg.reactions.filter((r) => r.user !== req.user?.id);
            msg.reactions.push({ user: req.user.id, emoji });
            return res.json(msg);
        }
        const message = await Message_1.default.findById(messageId);
        if (!message)
            return res.status(404).json({ error: 'Message not found' });
        const chat = await Chat_1.default.findOne({ _id: message.chat, user: req.user.id });
        if (!chat)
            return res.status(401).json({ error: 'Unauthorized' });
        message.reactions = message.reactions.filter((r) => r.user.toString() !== (req.user?.id || ''));
        message.reactions.push({
            user: req.user.id,
            emoji,
        });
        await message.save();
        return res.json(message);
    }
    catch (error) {
        console.error('Add reaction error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.addReaction = addReaction;
const editMessage = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { messageId } = req.params;
        const { text } = req.body;
        if (!text)
            return res.status(400).json({ error: 'Message text is required' });
        if (!(0, dbFallback_1.isDbConnected)()) {
            const msg = dbFallback_1.mockDb.messages.find((m) => m._id === messageId);
            if (!msg)
                return res.status(404).json({ error: 'Message not found' });
            msg.text = text;
            msg.isEdited = true;
            return res.json(msg);
        }
        const message = await Message_1.default.findById(messageId);
        if (!message || message.sender !== 'user') {
            return res.status(404).json({ error: 'User message not found' });
        }
        const chat = await Chat_1.default.findOne({ _id: message.chat, user: req.user.id });
        if (!chat)
            return res.status(401).json({ error: 'Unauthorized' });
        message.text = text;
        message.isEdited = true;
        await message.save();
        return res.json(message);
    }
    catch (error) {
        console.error('Edit message error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.editMessage = editMessage;
const exportChat = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { chatId } = req.params;
        if (!(0, dbFallback_1.isDbConnected)()) {
            const chat = dbFallback_1.mockDb.chats.find((c) => c._id === chatId);
            const msgs = dbFallback_1.mockDb.messages.filter((m) => m.chat === chatId);
            return res.json({ chat, messages: msgs });
        }
        const chat = await Chat_1.default.findOne({ _id: chatId, user: req.user.id });
        if (!chat) {
            return res.status(404).json({ error: 'Chat not found' });
        }
        const messages = await Message_1.default.find({ chat: chatId }).sort({ createdAt: 1 });
        return res.json({ chat, messages });
    }
    catch (error) {
        console.error('Export chat error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.exportChat = exportChat;
