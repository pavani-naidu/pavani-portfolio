import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  googleId?: string;
  avatar?: string;
  bio?: string;
  role: 'user' | 'admin';
  isVerified: boolean;
  verificationToken?: string;
  verificationTokenExpires?: Date;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  
  // Customizations
  settings: {
    theme: 'light' | 'dark';
    language: string;
    privacy: {
      shareData: boolean;
      anonymousAI: boolean;
    };
    notifications: {
      dailyReminder: boolean;
      journalReminder: boolean;
      waterReminder: boolean;
      studyReminder: boolean;
      meditationReminder: boolean;
      sleepReminder: boolean;
    };
  };

  // Gamification & Stats
  stats: {
    points: number;
    level: number;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate?: Date;
  };
  achievements: Array<{
    id: string;
    title: string;
    description: string;
    unlockedAt: Date;
    badgeUrl?: string;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
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
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password || '', salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidate, this.password);
};

export default mongoose.model<IUser>('User', UserSchema);
