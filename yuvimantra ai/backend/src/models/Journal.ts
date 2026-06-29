import mongoose, { Schema, Document } from 'mongoose';

export interface IJournal extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  content: string;
  tags: string[];
  moodEmoji?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentimentScore: number; // e.g. from -1 (extremely negative) to +1 (extremely positive)
  aiSummary?: string;
  date: Date;
  isFavorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const JournalSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    tags: [{ type: String, trim: true }],
    moodEmoji: { type: String, default: '' },
    sentiment: { type: String, enum: ['positive', 'neutral', 'negative'], default: 'neutral' },
    sentimentScore: { type: Number, default: 0 },
    aiSummary: { type: String, default: '' },
    date: { type: Date, required: true, default: Date.now },
    isFavorite: { type: Boolean, default: false },
  },
  { timestamps: true }
);

JournalSchema.index({ user: 1, date: -1 });

export default mongoose.model<IJournal>('Journal', JournalSchema);
