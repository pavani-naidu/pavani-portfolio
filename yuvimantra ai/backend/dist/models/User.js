"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const UserSchema = new mongoose_1.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    googleId: { type: String },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isVerified: { type: Boolean, default: false },
    verificationToken: { type: String },
    verificationTokenExpires: { type: Date },
    resetPasswordToken: { type: String },
    resetPasswordExpires: { type: Date },
    settings: {
        theme: { type: String, enum: ['light', 'dark'], default: 'dark' },
        language: { type: String, default: 'en' },
        privacy: {
            shareData: { type: Boolean, default: true },
            anonymousAI: { type: Boolean, default: false },
        },
        notifications: {
            dailyReminder: { type: Boolean, default: true },
            journalReminder: { type: Boolean, default: true },
            waterReminder: { type: Boolean, default: true },
            studyReminder: { type: Boolean, default: true },
            meditationReminder: { type: Boolean, default: true },
            sleepReminder: { type: Boolean, default: true },
        },
    },
    stats: {
        points: { type: Number, default: 0 },
        level: { type: Number, default: 1 },
        currentStreak: { type: Number, default: 0 },
        longestStreak: { type: Number, default: 0 },
        lastActiveDate: { type: Date },
    },
    achievements: [
        {
            id: { type: String, required: true },
            title: { type: String, required: true },
            description: { type: String, required: true },
            unlockedAt: { type: Date, default: Date.now },
            badgeUrl: { type: String },
        },
    ],
}, { timestamps: true });
// Hash password before saving
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password'))
        return next();
    try {
        const salt = await bcryptjs_1.default.genSalt(10);
        this.password = await bcryptjs_1.default.hash(this.password || '', salt);
        next();
    }
    catch (error) {
        next(error);
    }
});
// Compare password method
UserSchema.methods.comparePassword = async function (candidate) {
    if (!this.password)
        return false;
    return bcryptjs_1.default.compare(candidate, this.password);
};
exports.default = mongoose_1.default.model('User', UserSchema);
