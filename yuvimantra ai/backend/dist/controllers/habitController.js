"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteHabit = exports.uncompleteHabit = exports.completeHabit = exports.getHabits = exports.createHabit = void 0;
const Habit_1 = __importDefault(require("../models/Habit"));
const User_1 = __importDefault(require("../models/User"));
const dbFallback_1 = require("../utils/dbFallback");
// Helper to format date as YYYY-MM-DD in local time
const formatDateStr = (date) => {
    const d = new Date(date);
    const month = '' + (d.getMonth() + 1);
    const day = '' + d.getDate();
    const year = d.getFullYear();
    return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
};
const calculateStreak = (completions) => {
    if (completions.length === 0)
        return 0;
    const sorted = Array.from(new Set(completions)).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const todayStr = formatDateStr(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = formatDateStr(yesterday);
    if (sorted[0] !== todayStr && sorted[0] !== yesterdayStr) {
        return 0;
    }
    let streak = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
        const curr = new Date(sorted[i]);
        const next = new Date(sorted[i + 1]);
        const diffTime = Math.abs(curr.getTime() - next.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
            streak++;
        }
        else if (diffDays > 1) {
            break;
        }
    }
    return streak;
};
const createHabit = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { name, type, icon, frequency, isCustom } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Habit name is required' });
        }
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Creating new habit...');
            const newHabit = await dbFallback_1.mockHabits.create(req.user.id, { name, type, icon, frequency, isCustom });
            return res.status(201).json(newHabit);
        }
        const newHabit = new Habit_1.default({
            user: req.user.id,
            name,
            type: type || 'custom',
            icon: icon || 'check',
            frequency: frequency || 'daily',
            isCustom: isCustom || false,
        });
        await newHabit.save();
        return res.status(201).json(newHabit);
    }
    catch (error) {
        console.error('Create habit error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.createHabit = createHabit;
const getHabits = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Querying active habits...');
            const list = await dbFallback_1.mockHabits.list(req.user.id);
            return res.json(list);
        }
        const habits = await Habit_1.default.find({ user: req.user.id, isArchived: false });
        return res.json(habits);
    }
    catch (error) {
        console.error('Get habits error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.getHabits = getHabits;
const completeHabit = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { habitId } = req.params;
        const { date } = req.body;
        const targetDateStr = date || formatDateStr(new Date());
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Completing habit streak...');
            const habit = await dbFallback_1.mockHabits.complete(req.user.id, habitId, targetDateStr);
            return res.json(habit);
        }
        const habit = await Habit_1.default.findOne({ _id: habitId, user: req.user.id });
        if (!habit) {
            return res.status(404).json({ error: 'Habit not found' });
        }
        if (!habit.completions.includes(targetDateStr)) {
            habit.completions.push(targetDateStr);
        }
        habit.streak = calculateStreak(habit.completions);
        if (habit.streak > habit.maxStreak) {
            habit.maxStreak = habit.streak;
        }
        await habit.save();
        const userObj = await User_1.default.findById(req.user.id);
        if (userObj) {
            userObj.stats.points += 5;
            await userObj.save();
        }
        return res.json(habit);
    }
    catch (error) {
        console.error('Complete habit error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.completeHabit = completeHabit;
const uncompleteHabit = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { habitId } = req.params;
        const { date } = req.body;
        const targetDateStr = date || formatDateStr(new Date());
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Uncompleting habit...');
            const habit = await dbFallback_1.mockHabits.uncomplete(req.user.id, habitId, targetDateStr);
            return res.json(habit);
        }
        const habit = await Habit_1.default.findOne({ _id: habitId, user: req.user.id });
        if (!habit) {
            return res.status(404).json({ error: 'Habit not found' });
        }
        habit.completions = habit.completions.filter((c) => c !== targetDateStr);
        habit.streak = calculateStreak(habit.completions);
        await habit.save();
        return res.json(habit);
    }
    catch (error) {
        console.error('Uncomplete habit error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.uncompleteHabit = uncompleteHabit;
const deleteHabit = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const { habitId } = req.params;
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Deleting habit...');
            const result = await dbFallback_1.mockHabits.delete(req.user.id, habitId);
            return res.json(result);
        }
        const habit = await Habit_1.default.findOneAndDelete({ _id: habitId, user: req.user.id });
        if (!habit) {
            return res.status(404).json({ error: 'Habit not found' });
        }
        return res.json({ message: 'Habit deleted successfully' });
    }
    catch (error) {
        console.error('Delete habit error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.deleteHabit = deleteHabit;
