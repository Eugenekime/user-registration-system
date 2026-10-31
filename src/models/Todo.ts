import mongoose, { Schema } from 'mongoose';

const TodoSchema = new Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

TodoSchema.index({ userId: 1, createdAt: -1 });
TodoSchema.index({ userId: 1, completed: 1 });

const Todo = mongoose.model('Todo', TodoSchema);

export default Todo;
