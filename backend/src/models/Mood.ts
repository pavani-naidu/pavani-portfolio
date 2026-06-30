import mongoose, { Schema, Document } from 'mongoose';

export interface IMood extends Document {
  user: mongoose.Types.ObjectId;
  mood: string;       // e.g. "happy", "calm", "anxious", "sad", "energetic", "tired"
  value: number;      // 1 to 5 scale (1 = very low, 5 = very high emotional score)
  emoji: string;      // e.g. "😊", "🧘", "😰", "😢", "⚡", "😴"
  note?: string;
  tags?: string[];    // e.g. ["study", "sleep", "exercise", "family"]
  date: Date;         // The day this entry corresponds to
  createdAt: Date;
  updatedAt: Date;
}

const MoodSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    mood: { type: String, required: true },
    value: { type: Number, required: true, min: 1, max: 5 },
    emoji: { type: String, required: true },
    note: { type: String, default: '' },
    tags: [{ type: String }],
    date: { type: Date, required: true, default: Date.now },
  },
  { timestamps: true }
);

// Ensure a user logs at most one main mood per day, or allows multiple log entries. Let's allow multiple, but index by date.
MoodSchema.index({ user: 1, date: -1 });

export default mongoose.model<IMood>('Mood', MoodSchema);
