import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  dueDate: String,
  dueTime: String,
  createdAt: { type: Number, required: true },
  category: String,
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
});

export const Task = mongoose.model('Task', taskSchema);
