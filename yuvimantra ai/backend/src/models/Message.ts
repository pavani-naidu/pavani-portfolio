import mongoose, { Schema, Document } from 'mongoose';

export interface IMessage extends Document {
  chat: mongoose.Types.ObjectId;
  sender: 'user' | 'ai';
  text: string;
  reactions: Array<{
    user: mongoose.Types.ObjectId;
    emoji: string;
  }>;
  suggestions?: string[];
  voiceUrl?: string;
  isEdited: boolean;
  isRegenerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema: Schema = new Schema(
  {
    chat: { type: Schema.Types.ObjectId, ref: 'Chat', required: true, index: true },
    sender: { type: String, enum: ['user', 'ai'], required: true },
    text: { type: String, required: true },
    reactions: [
      {
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        emoji: { type: String, required: true },
      },
    ],
    suggestions: [{ type: String }],
    voiceUrl: { type: String },
    isEdited: { type: Boolean, default: false },
    isRegenerated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model<IMessage>('Message', MessageSchema);
