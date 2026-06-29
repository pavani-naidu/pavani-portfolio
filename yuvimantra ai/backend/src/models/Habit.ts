import mongoose, { Schema, Document } from 'mongoose';

export interface IHabit extends Document {
  user: mongoose.Types.ObjectId;
  name: string;
  type: 'exercise' | 'meditation' | 'water' | 'prayer' | 'reading' | 'coding' | 'walking' | 'custom';
  isCustom: boolean;
  icon: string;
  frequency: 'daily' | 'weekly';
  streak: number;
  maxStreak: number;
  completions: string[]; // Store date strings as 'YYYY-MM-DD' for timezone-independent logs
  isArchived: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HabitSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['exercise', 'meditation', 'water', 'prayer', 'reading', 'coding', 'walking', 'custom'],
      default: 'custom',
    },
    isCustom: { type: Boolean, default: false },
    icon: { type: String, default: 'check' },
    frequency: { type: String, enum: ['daily', 'weekly'], default: 'daily' },
    streak: { type: Number, default: 0 },
    maxStreak: { type: Number, default: 0 },
    completions: [{ type: String }], // e.g. ["2026-06-29", "2026-06-28"]
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IHabit>('Habit', HabitSchema);
