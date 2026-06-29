"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgotPassword = exports.verifyEmail = exports.refreshToken = exports.login = exports.signup = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const User_1 = __importDefault(require("../models/User"));
const dbFallback_1 = require("../utils/dbFallback");
const signupSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, 'Name must be at least 2 characters'),
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
    rememberMe: zod_1.z.boolean().optional(),
});
const generateTokens = (userId, role) => {
    const secret = process.env.JWT_SECRET || 'yuvimantra_secret_access_key_987654321';
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'yuvimantra_secret_refresh_key_123456789';
    const accessToken = jsonwebtoken_1.default.sign({ id: userId, role }, secret, { expiresIn: '15m' });
    const refreshToken = jsonwebtoken_1.default.sign({ id: userId, role }, refreshSecret, { expiresIn: '7d' });
    return { accessToken, refreshToken };
};
const signup = async (req, res) => {
    try {
        const validated = signupSchema.parse(req.body);
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Processing user signup...');
            const newUser = await dbFallback_1.mockAuth.signup(validated);
            const { accessToken, refreshToken } = generateTokens(newUser._id, newUser.role);
            return res.status(201).json({
                message: 'Signup successful! Running in Local Demo Mode.',
                accessToken,
                refreshToken,
                user: newUser,
            });
        }
        // Check if email already exists
        const existingUser = await User_1.default.findOne({ email: validated.email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered' });
        }
        // Generate verify token (mocked workflow)
        const verificationToken = Math.random().toString(36).substring(2, 15);
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
        // Create user
        const newUser = new User_1.default({
            name: validated.name,
            email: validated.email,
            password: validated.password,
            isVerified: false, // Starts as false
            verificationToken,
            verificationTokenExpires,
        });
        await newUser.save();
        const { accessToken, refreshToken } = generateTokens(newUser._id.toString(), newUser.role);
        return res.status(201).json({
            message: 'Signup successful! Verification email sent (mocked).',
            accessToken,
            refreshToken,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
                isVerified: newUser.isVerified,
                settings: newUser.settings,
                stats: newUser.stats,
                achievements: newUser.achievements,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Signup error:', error);
        return res.status(500).json({ error: 'Server error during signup' });
    }
};
exports.signup = signup;
const login = async (req, res) => {
    try {
        const validated = loginSchema.parse(req.body);
        if (!(0, dbFallback_1.isDbConnected)()) {
            console.log('[Offline Mode] Processing user login...');
            const user = await dbFallback_1.mockAuth.login(validated);
            const { accessToken, refreshToken } = generateTokens(user._id, user.role);
            return res.json({
                message: 'Login successful! Running in Local Demo Mode.',
                accessToken,
                refreshToken,
                user,
            });
        }
        const user = await User_1.default.findOne({ email: validated.email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        const isMatch = await user.comparePassword(validated.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid email or password' });
        }
        // Award point for logging in (once per day)
        const today = new Date().toDateString();
        const lastActive = user.stats.lastActiveDate?.toDateString();
        if (lastActive !== today) {
            user.stats.points += 10;
            user.stats.lastActiveDate = new Date();
            // Calculate streak
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const yesterdayStr = yesterday.toDateString();
            if (lastActive === yesterdayStr) {
                user.stats.currentStreak += 1;
                if (user.stats.currentStreak > user.stats.longestStreak) {
                    user.stats.longestStreak = user.stats.currentStreak;
                }
            }
            else {
                user.stats.currentStreak = 1;
            }
            // Check level-up (every 100 points)
            const newLevel = Math.floor(user.stats.points / 100) + 1;
            if (newLevel > user.stats.level) {
                user.stats.level = newLevel;
                user.achievements.push({
                    id: `level_${newLevel}`,
                    title: `Level ${newLevel} Achiever`,
                    description: `Reached level ${newLevel} by focusing on emotional wellness and studies.`,
                    unlockedAt: new Date(),
                });
            }
            // Check streak achievements
            if (user.stats.currentStreak === 3 && !user.achievements.some(a => a.id === 'streak_3')) {
                user.achievements.push({
                    id: 'streak_3',
                    title: 'Wellness Habit Initializer',
                    description: 'Logged in for 3 consecutive days!',
                    unlockedAt: new Date(),
                });
            }
            await user.save();
        }
        const { accessToken, refreshToken } = generateTokens(user._id.toString(), user.role);
        return res.json({
            message: 'Login successful',
            accessToken,
            refreshToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                isVerified: user.isVerified,
                settings: user.settings,
                stats: user.stats,
                achievements: user.achievements,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({ error: error.errors[0].message });
        }
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Server error during login' });
    }
};
exports.login = login;
const refreshToken = (req, res) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(401).json({ error: 'Refresh token required' });
    }
    const refreshSecret = process.env.JWT_REFRESH_SECRET || 'yuvimantra_secret_refresh_key_123456789';
    try {
        jsonwebtoken_1.default.verify(refreshToken, refreshSecret, (err, decoded) => {
            if (err) {
                return res.status(403).json({ error: 'Invalid or expired refresh token' });
            }
            const secret = process.env.JWT_SECRET || 'yuvimantra_secret_access_key_987654321';
            const accessToken = jsonwebtoken_1.default.sign({ id: decoded.id, role: decoded.role }, secret, { expiresIn: '15m' });
            return res.json({ accessToken });
        });
    }
    catch (error) {
        console.error('Refresh token error:', error);
        return res.status(500).json({ error: 'Server error during token refresh' });
    }
};
exports.refreshToken = refreshToken;
const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;
        const user = await User_1.default.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: new Date() },
        });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired verification token' });
        }
        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        // Award point for verification
        user.stats.points += 50;
        user.achievements.push({
            id: 'email_verified',
            title: 'Verified Soul',
            description: 'Successfully verified email address.',
            unlockedAt: new Date(),
        });
        await user.save();
        return res.json({ message: 'Email successfully verified!' });
    }
    catch (error) {
        console.error('Email verification error:', error);
        return res.status(500).json({ error: 'Server error during email verification' });
    }
};
exports.verifyEmail = verifyEmail;
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User_1.default.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'No account with that email address exists' });
        }
        const resetToken = Math.random().toString(36).substring(2, 15);
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
        await user.save();
        return res.json({ message: 'Password reset link sent (mocked)', resetToken });
    }
    catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;
        const user = await User_1.default.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: new Date() },
        });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();
        return res.json({ message: 'Password has been reset successfully' });
    }
    catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
exports.resetPassword = resetPassword;
