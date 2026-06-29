import mongoose, { Schema, Document } from 'mongoose';

export interface ITask extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  subject: string;
  category: 'assignment' | 'exam' | 'study' | 'other';
  priority: 'low' | 'medium' | 'high';
  dueDate: Date;
  isCompleted: boolean;
  pomodorosExpected: number;
  pomodorosSpent: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema: Schema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['assignment', 'exam', 'study', 'other'],
      default: 'study',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    dueDate: { type: Date, required: true },
    isCompleted: { type: Boolean, default: false },
    pomodorosExpected: { type: Number, default: 1 },
    pomodorosSpent: { type: Number, default: 0 },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.model<ITask>('Task', TaskSchema);
