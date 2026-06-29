import mongoose, { Schema, Document } from 'mongoose';

export interface IChat extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  isPinned: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ChatSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    isPinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IChat>('Chat', ChatSchema);
