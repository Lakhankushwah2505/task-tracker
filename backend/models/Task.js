const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [3, 'Title must be at least 3 characters'],
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    status: {
      type: String,
      enum: ['todo', 'in-progress', 'done'],
      default: 'todo',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: [true, 'Priority is required'],
    },
    category: {
      type: String,
      enum: ['general', 'work', 'personal', 'shopping', 'health'],
      default: 'general',
    },
    due: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt
  }
);

// Index for efficient filtering/sorting
taskSchema.index({ status: 1, priority: 1, createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);
