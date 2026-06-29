"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlannerStats = exports.deleteTask = exports.updateTask = exports.getTasks = exports.createTask = void 0;
const Task_1 = __importDefault(require("../models/Task"));
const User_1 = __importDefault(require("../models/User"));
const dbFallback_1 = require("../utils/dbFallback");
const createTask = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { title, subject, category, priority, dueDate, pomodorosExpected, notes } = req.body;
        if (!title || !subject || !dueDate) {
            return res.status(400).json({ error: 'Title, subject, and due date are required' });
        }
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Scheduling study task plan...');
            const newTask = await dbFallback_1.mockTasks.create(req.user.id, { title, subject, category, priority, dueDate, pomodorosExpected, notes });
            return res.status(201).json(newTask);
        }
        const newTask = new Task_1.default({
            user: req.user.id,
            title,
            subject,
            category: category || 'study',
            priority: priority || 'medium',
            dueDate: new Date(dueDate),
            pomodorosExpected: pomodorosExpected || 1,
            notes: notes || '',
        });
        await newTask.save();
        return res.status(201).json(newTask);
    }
    catch (error) {
        console.error('Create task error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.createTask = createTask;
const getTasks = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Querying study tasks checklist...');
            const list = await dbFallback_1.mockTasks.list(req.user.id);
            return res.json(list);
        }
        const tasks = await Task_1.default.find({ user: req.user.id }).sort({ dueDate: 1 });
        return res.json(tasks);
    }
    catch (error) {
        console.error('Get tasks error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.getTasks = getTasks;
const updateTask = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { title, subject, category, priority, dueDate, isCompleted, pomodorosExpected, pomodorosSpent, notes } = req.body;
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Updating task completion / pomodoros logs...');
            const updated = await dbFallback_1.mockTasks.update(req.user.id, req.params.id, { title, subject, category, priority, dueDate, isCompleted, pomodorosExpected, pomodorosSpent, notes });
            return res.json(updated);
        }
        const task = await Task_1.default.findOne({ _id: req.params.id, user: req.user.id });
        if (!task)
            return res.status(404).json({ error: 'Task not found' });
        if (title)
            task.title = title;
        if (subject)
            task.subject = subject;
        if (category)
            task.category = category;
        if (priority)
            task.priority = priority;
        if (dueDate)
            task.dueDate = new Date(dueDate);
        if (notes !== undefined)
            task.notes = notes;
        if (pomodorosExpected !== undefined)
            task.pomodorosExpected = pomodorosExpected;
        if (pomodorosSpent !== undefined) {
            task.pomodorosSpent = pomodorosSpent;
            const userObj = await User_1.default.findById(req.user.id);
            if (userObj && pomodorosSpent > task.pomodorosSpent) {
                userObj.stats.points += 5 * (pomodorosSpent - task.pomodorosSpent);
                await userObj.save();
            }
        }
        if (isCompleted !== undefined && isCompleted !== task.isCompleted) {
            task.isCompleted = isCompleted;
            if (isCompleted) {
                const userObj = await User_1.default.findById(req.user.id);
                if (userObj) {
                    userObj.stats.points += 15;
                    await userObj.save();
                }
            }
        }
        await task.save();
        return res.json(task);
    }
    catch (error) {
        console.error('Update task error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.updateTask = updateTask;
const deleteTask = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Deleting task entry...');
            const result = await dbFallback_1.mockTasks.delete(req.user.id, req.params.id);
            return res.json(result);
        }
        const task = await Task_1.default.findOneAndDelete({ _id: req.params.id, user: req.user.id });
        if (!task)
            return res.status(404).json({ error: 'Task not found' });
        return res.json({ message: 'Task deleted successfully' });
    }
    catch (error) {
        console.error('Delete task error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.deleteTask = deleteTask;
const getPlannerStats = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        let userTasks = [];
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Compiling planner stats...');
            userTasks = dbFallback_1.mockDb.tasks.filter((t) => t.user === req.user?.id);
        }
        else {
            userTasks = await Task_1.default.find({ user: req.user.id });
        }
        const total = userTasks.length;
        const completed = userTasks.filter((t) => t.isCompleted).length;
        const pending = total - completed;
        let totalPomodorosSpent = 0;
        const subjectCounts = {};
        const countdowns = [];
        userTasks.forEach((t) => {
            totalPomodorosSpent += t.pomodorosSpent;
            subjectCounts[t.subject] = (subjectCounts[t.subject] || 0) + 1;
            if (t.category === 'exam' && !t.isCompleted) {
                const diffTime = new Date(t.dueDate).getTime() - new Date().getTime();
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                countdowns.push({
                    title: t.title,
                    subject: t.subject,
                    daysLeft: diffDays > 0 ? diffDays : 0,
                    dueDate: t.dueDate,
                });
            }
        });
        return res.json({
            summary: {
                total,
                completed,
                pending,
                completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
                totalPomodorosSpent,
            },
            subjectCounts,
            countdowns: countdowns.sort((a, b) => a.daysLeft - b.daysLeft).slice(0, 3),
        });
    }
    catch (error) {
        console.error('Get planner stats error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.getPlannerStats = getPlannerStats;
