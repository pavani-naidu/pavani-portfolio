"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockTasks = exports.mockJournals = exports.mockHabits = exports.mockAuth = exports.seedMockData = exports.mockDb = exports.isDbConnected = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const gemini_1 = require("./gemini");
const isDbConnected = () => {
    return mongoose_1.default.connection.readyState === 1;
};
exports.isDbConnected = isDbConnected;
// In-Memory Database Collections
exports.mockDb = {
    users: [],
    chats: [],
    messages: [],
    moods: [],
    journals: [],
    habits: [],
    tasks: [],
    notifications: [],
    feedbacks: [],
};
// Seed initial default items if empty
const seedMockData = () => {
    if (exports.mockDb.users.length === 0) {
        console.log('[Offline DB] Seeding mock data collections...');
    }
};
exports.seedMockData = seedMockData;
// Auth Mock Actions
exports.mockAuth = {
    signup: async (userData) => {
        const existing = exports.mockDb.users.find(u => u.email === userData.email.toLowerCase());
        if (existing)
            throw new Error('Email is already registered');
        const newUser = {
            _id: 'mock_user_' + Math.random().toString(36).substring(2, 9),
            name: userData.name,
            email: userData.email.toLowerCase(),
            password: userData.password, // Keep as-is for demo simplicity
            role: 'user',
            isVerified: true,
            settings: {
                theme: 'dark',
                language: 'en',
                privacy: { shareData: true, anonymousAI: false },
                notifications: {
                    dailyReminder: true,
                    journalReminder: true,
                    waterReminder: true,
                    studyReminder: true,
                    meditationReminder: true,
                    sleepReminder: true,
                },
            },
            stats: { points: 10, level: 1, currentStreak: 1, longestStreak: 1, lastActiveDate: new Date().toISOString() },
            achievements: [
                { id: 'registered', title: 'Onboarding Complete', description: 'Joined YuviMantra AI wellness app.', unlockedAt: new Date().toISOString() }
            ],
            createdAt: new Date().toISOString(),
        };
        exports.mockDb.users.push(newUser);
        return newUser;
    },
    login: async (credentials) => {
        const user = exports.mockDb.users.find(u => u.email === credentials.email.toLowerCase());
        if (!user)
            throw new Error('Invalid email or password');
        if (user.password !== credentials.password)
            throw new Error('Invalid email or password');
        // Add points for logging in
        user.stats.points += 10;
        user.stats.lastActiveDate = new Date().toISOString();
        return user;
    }
};
// Habit Mock Actions
exports.mockHabits = {
    create: async (userId, data) => {
        const newHabit = {
            _id: 'mock_habit_' + Math.random().toString(36).substring(2, 9),
            user: userId,
            name: data.name,
            type: data.type || 'custom',
            icon: data.icon || 'check',
            frequency: data.frequency || 'daily',
            streak: 0,
            maxStreak: 0,
            completions: [],
            isArchived: false,
            createdAt: new Date().toISOString(),
        };
        exports.mockDb.habits.push(newHabit);
        return newHabit;
    },
    list: async (userId) => {
        return exports.mockDb.habits.filter(h => h.user === userId && !h.isArchived);
    },
    complete: async (userId, habitId, dateStr) => {
        const habit = exports.mockDb.habits.find(h => h._id === habitId && h.user === userId);
        if (!habit)
            throw new Error('Habit not found');
        if (!habit.completions.includes(dateStr)) {
            habit.completions.push(dateStr);
        }
        // Simple streak increment
        habit.streak += 1;
        if (habit.streak > habit.maxStreak)
            habit.maxStreak = habit.streak;
        // Award XP to user
        const user = exports.mockDb.users.find(u => u._id === userId);
        if (user)
            user.stats.points += 5;
        return habit;
    },
    uncomplete: async (userId, habitId, dateStr) => {
        const habit = exports.mockDb.habits.find(h => h._id === habitId && h.user === userId);
        if (!habit)
            throw new Error('Habit not found');
        habit.completions = habit.completions.filter((c) => c !== dateStr);
        if (habit.streak > 0)
            habit.streak -= 1;
        return habit;
    },
    delete: async (userId, habitId) => {
        exports.mockDb.habits = exports.mockDb.habits.filter(h => !(h._id === habitId && h.user === userId));
        return { message: 'Habit deleted' };
    }
};
// Journal Mock Actions
exports.mockJournals = {
    create: async (userId, data) => {
        const sentimentResult = await (0, gemini_1.analyzeSentiment)(data.content);
        const aiSummary = await (0, gemini_1.generateJournalSummary)(data.content);
        const newJournal = {
            _id: 'mock_journal_' + Math.random().toString(36).substring(2, 9),
            user: userId,
            title: data.title,
            content: data.content,
            tags: data.tags || [],
            moodEmoji: data.moodEmoji || '',
            sentiment: sentimentResult.sentiment,
            sentimentScore: sentimentResult.score,
            aiSummary,
            date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
            isFavorite: false,
            createdAt: new Date().toISOString(),
        };
        exports.mockDb.journals.push(newJournal);
        return newJournal;
    },
    list: async (userId, query) => {
        let list = exports.mockDb.journals.filter(j => j.user === userId);
        if (query.search) {
            const q = query.search.toLowerCase();
            list = list.filter(j => j.title.toLowerCase().includes(q) || j.content.toLowerCase().includes(q));
        }
        if (query.tag) {
            list = list.filter(j => j.tags.includes(query.tag));
        }
        return list;
    },
    update: async (userId, journalId, data) => {
        const journal = exports.mockDb.journals.find(j => j._id === journalId && j.user === userId);
        if (!journal)
            throw new Error('Journal not found');
        if (data.title)
            journal.title = data.title;
        if (data.tags)
            journal.tags = data.tags;
        if (data.moodEmoji !== undefined)
            journal.moodEmoji = data.moodEmoji;
        if (data.isFavorite !== undefined)
            journal.isFavorite = data.isFavorite;
        if (data.content && data.content !== journal.content) {
            journal.content = data.content;
            const sentimentResult = await (0, gemini_1.analyzeSentiment)(data.content);
            const aiSummary = await (0, gemini_1.generateJournalSummary)(data.content);
            journal.sentiment = sentimentResult.sentiment;
            journal.sentimentScore = sentimentResult.score;
            journal.aiSummary = aiSummary;
        }
        return journal;
    },
    delete: async (userId, journalId) => {
        exports.mockDb.journals = exports.mockDb.journals.filter(j => !(j._id === journalId && j.user === userId));
        return { message: 'Journal deleted' };
    }
};
// Task Planner Mock Actions
exports.mockTasks = {
    create: async (userId, data) => {
        const newTask = {
            _id: 'mock_task_' + Math.random().toString(36).substring(2, 9),
            user: userId,
            title: data.title,
            subject: data.subject,
            category: data.category || 'study',
            priority: data.priority || 'medium',
            dueDate: data.dueDate ? new Date(data.dueDate).toISOString() : new Date().toISOString(),
            isCompleted: false,
            pomodorosExpected: data.pomodorosExpected || 1,
            pomodorosSpent: 0,
            notes: data.notes || '',
            createdAt: new Date().toISOString(),
        };
        exports.mockDb.tasks.push(newTask);
        return newTask;
    },
    list: async (userId) => {
        return exports.mockDb.tasks.filter(t => t.user === userId);
    },
    update: async (userId, taskId, data) => {
        const task = exports.mockDb.tasks.find(t => t._id === taskId && t.user === userId);
        if (!task)
            throw new Error('Task not found');
        if (data.title)
            task.title = data.title;
        if (data.subject)
            task.subject = data.subject;
        if (data.category)
            task.category = data.category;
        if (data.priority)
            task.priority = data.priority;
        if (data.dueDate)
            task.dueDate = new Date(data.dueDate).toISOString();
        if (data.notes !== undefined)
            task.notes = data.notes;
        if (data.pomodorosExpected !== undefined)
            task.pomodorosExpected = data.pomodorosExpected;
        if (data.pomodorosSpent !== undefined) {
            task.pomodorosSpent = data.pomodorosSpent;
        }
        if (data.isCompleted !== undefined && data.isCompleted !== task.isCompleted) {
            task.isCompleted = data.isCompleted;
            if (data.isCompleted) {
                const user = exports.mockDb.users.find(u => u._id === userId);
                if (user)
                    user.stats.points += 15;
            }
        }
        return task;
    },
    delete: async (userId, taskId) => {
        exports.mockDb.tasks = exports.mockDb.tasks.filter(t => !(t._id === taskId && t.user === userId));
        return { message: 'Task deleted' };
    }
};
