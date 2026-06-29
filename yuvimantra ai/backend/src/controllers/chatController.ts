import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Chat from '../models/Chat';
import Message from '../models/Message';
import User from '../models/User';
import { generateChatResponse } from '../utils/gemini';
import { isDbConnected, mockDb } from '../utils/dbFallback';

export const createChat = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    if (!isDbConnected()) {
      console.log('[Offline Mode] Creating new chat session...');
      const newChat = {
        _id: 'mock_chat_' + Math.random().toString(36).substring(2, 9),
        user: req.user.id,
        title: req.body.title || 'New Conversation',
        isPinned: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockDb.chats.push(newChat);
      return res.status(201).json(newChat);
    }

    const newChat = new Chat({
      user: req.user.id,
      title: req.body.title || 'New Conversation',
    });

    await newChat.save();
    return res.status(201).json(newChat);
  } catch (error) {
    console.error('Create chat error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getChats = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    if (!isDbConnected()) {
      console.log('[Offline Mode] Retrieving chats...');
      const userChats = mockDb.chats
        .filter((c) => c.user === req.user?.id)
        .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      return res.json(userChats);
    }

    const chats = await Chat.find({ user: req.user.id }).sort({ isPinned: -1, updatedAt: -1 });
    return res.json(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const getChatMessages = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { chatId } = req.params;

    if (!isDbConnected()) {
      console.log('[Offline Mode] Retrieving chat messages...');
      const chatMsgs = mockDb.messages.filter((m) => m.chat === chatId);
      return res.json(chatMsgs);
    }

    const chat = await Chat.findOne({ _id: chatId, user: req.user.id });
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const messages = await Message.find({ chat: chatId }).sort({ createdAt: 1 });
    return res.json(messages);
  } catch (error) {
    console.error('Get chat messages error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { chatId } = req.params;
    const { text, voiceUrl } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Message text is required' });
    }

    if (!isDbConnected()) {
      console.log('[Offline Mode] Processing prompt and streaming response...');
      const chat = mockDb.chats.find((c) => c._id === chatId);
      if (!chat) return res.status(404).json({ error: 'Chat not found' });

      // Update title on first message
      const msgCount = mockDb.messages.filter((m) => m.chat === chatId).length;
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
      mockDb.messages.push(userMsg);

      // Call Gemini model
      const aiResponseText = await generateChatResponse([], text);
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
      mockDb.messages.push(aiMsg);

      chat.updatedAt = new Date();
      return res.status(201).json({ userMessage: userMsg, aiMessage: aiMsg });
    }

    const chat = await Chat.findOne({ _id: chatId, user: req.user.id });
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const messageCount = await Message.countDocuments({ chat: chatId });
    if (messageCount === 0) {
      chat.title = text.length > 30 ? text.substring(0, 30) + '...' : text;
      await chat.save();
    }

    const userMsg = new Message({
      chat: chatId,
      sender: 'user',
      text,
      voiceUrl,
    });
    await userMsg.save();

    const historyMsgs = await Message.find({ chat: chatId }).sort({ createdAt: -1 }).limit(21);
    const pastMsgs = historyMsgs.reverse().filter((m) => m._id.toString() !== userMsg._id.toString());

    const history = pastMsgs.map((m) => ({
      role: m.sender === 'user' ? ('user' as const) : ('model' as const),
      parts: m.text,
    }));

    const aiResponseText = await generateChatResponse(history, text);

    const suggestions: string[] = [];
    const lowerResponse = aiResponseText.toLowerCase();
    if (lowerResponse.includes('stress') || lowerResponse.includes('anxious') || lowerResponse.includes('breath')) {
      suggestions.push('Can you guide me through a breathing exercise?', 'What are some fast stress relievers?');
    } else if (lowerResponse.includes('study') || lowerResponse.includes('exam') || lowerResponse.includes('focus')) {
      suggestions.push('How does the Pomodoro technique work?', 'Help me make a revision plan.');
    } else {
      suggestions.push('Tell me a motivational quote.', 'How can I build healthy habits?', 'Thanks, that helps!');
    }

    const aiMsg = new Message({
      chat: chatId,
      sender: 'ai',
      text: aiResponseText,
      suggestions,
    });
    await aiMsg.save();

    const userObj = await User.findById(req.user.id);
    if (userObj) {
      userObj.stats.points += 2;
      await userObj.save();
    }

    chat.updatedAt = new Date();
    await chat.save();

    return res.status(201).json({ userMessage: userMsg, aiMessage: aiMsg });
  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const pinChat = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    if (!isDbConnected()) {
      const chat = mockDb.chats.find((c) => c._id === req.params.chatId);
      if (!chat) return res.status(404).json({ error: 'Chat not found' });
      chat.isPinned = true;
      return res.json(chat);
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.chatId, user: req.user.id },
      { isPinned: true },
      { new: true }
    );

    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    return res.json(chat);
  } catch (error) {
    console.error('Pin chat error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const unpinChat = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    if (!isDbConnected()) {
      const chat = mockDb.chats.find((c) => c._id === req.params.chatId);
      if (!chat) return res.status(404).json({ error: 'Chat not found' });
      chat.isPinned = false;
      return res.json(chat);
    }

    const chat = await Chat.findOneAndUpdate(
      { _id: req.params.chatId, user: req.user.id },
      { isPinned: false },
      { new: true }
    );

    if (!chat) return res.status(404).json({ error: 'Chat not found' });
    return res.json(chat);
  } catch (error) {
    console.error('Unpin chat error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const deleteChat = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    if (!isDbConnected()) {
      mockDb.chats = mockDb.chats.filter((c) => c._id !== req.params.chatId);
      mockDb.messages = mockDb.messages.filter((m) => m.chat !== req.params.chatId);
      return res.json({ message: 'Conversation deleted successfully' });
    }

    const chat = await Chat.findOneAndDelete({ _id: req.params.chatId, user: req.user.id });
    if (!chat) return res.status(404).json({ error: 'Chat not found' });

    await Message.deleteMany({ chat: req.params.chatId });

    return res.json({ message: 'Conversation deleted successfully' });
  } catch (error) {
    console.error('Delete chat error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const addReaction = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { messageId } = req.params;
    const { emoji } = req.body;

    if (!emoji) return res.status(400).json({ error: 'Emoji is required' });

    if (!isDbConnected()) {
      const msg = mockDb.messages.find((m) => m._id === messageId);
      if (!msg) return res.status(404).json({ error: 'Message not found' });
      msg.reactions = msg.reactions.filter((r: any) => r.user !== req.user?.id);
      msg.reactions.push({ user: req.user.id, emoji });
      return res.json(msg);
    }

    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ error: 'Message not found' });

    const chat = await Chat.findOne({ _id: message.chat, user: req.user.id });
    if (!chat) return res.status(401).json({ error: 'Unauthorized' });

    message.reactions = message.reactions.filter((r) => r.user.toString() !== (req.user?.id || ''));
    message.reactions.push({
      user: req.user.id as any,
      emoji,
    });

    await message.save();
    return res.json(message);
  } catch (error) {
    console.error('Add reaction error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const editMessage = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { messageId } = req.params;
    const { text } = req.body;

    if (!text) return res.status(400).json({ error: 'Message text is required' });

    if (!isDbConnected()) {
      const msg = mockDb.messages.find((m) => m._id === messageId);
      if (!msg) return res.status(404).json({ error: 'Message not found' });
      msg.text = text;
      msg.isEdited = true;
      return res.json(msg);
    }

    const message = await Message.findById(messageId);
    if (!message || message.sender !== 'user') {
      return res.status(404).json({ error: 'User message not found' });
    }

    const chat = await Chat.findOne({ _id: message.chat, user: req.user.id });
    if (!chat) return res.status(401).json({ error: 'Unauthorized' });

    message.text = text;
    message.isEdited = true;
    await message.save();

    return res.json(message);
  } catch (error) {
    console.error('Edit message error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};

export const exportChat = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { chatId } = req.params;

    if (!isDbConnected()) {
      const chat = mockDb.chats.find((c) => c._id === chatId);
      const msgs = mockDb.messages.filter((m) => m.chat === chatId);
      return res.json({ chat, messages: msgs });
    }

    const chat = await Chat.findOne({ _id: chatId, user: req.user.id });
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    const messages = await Message.find({ chat: chatId }).sort({ createdAt: 1 });
    return res.json({ chat, messages });
  } catch (error) {
    console.error('Export chat error:', error);
    return res.status(500).json({ error: 'Server error' });
  }
};
