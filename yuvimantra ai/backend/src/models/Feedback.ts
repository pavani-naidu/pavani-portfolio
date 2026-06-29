import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  user?: mongoose.Types.ObjectId;
  rating: number; // 1 to 5
  comment: string;
  category: 'ai' | 'ui' | 'study' | 'wellness' | 'other';
  createdAt: Date;
}

const FeedbackSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: false },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['ai', 'ui', 'study', 'wellness', 'other'],
      default: 'other',
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema);
