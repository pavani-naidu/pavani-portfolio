import mongoose, { Schema, Document } from 'mongoose';

export interface INotification extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'daily' | 'journal' | 'water' | 'study' | 'meditation' | 'sleep' | 'system';
  isRead: boolean;
  scheduledFor?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['daily', 'journal', 'water', 'study', 'meditation', 'sleep', 'system'],
      default: 'system',
    },
    isRead: { type: Boolean, default: false },
    scheduledFor: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', NotificationSchema);
