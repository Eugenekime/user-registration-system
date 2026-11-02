import Todo from '../models/Todo.js';
import mongoose from 'mongoose';
import type { TodoPostBody, TodoPutBody } from '../types/todo.js';
import { AppError } from '../utils/AppError.js';

export async function getAllTodoService(
  userId: string,
  page: number,
  limit: number,
  filters: {
    completed?: boolean;
    priority?: 'low' | 'medium' | 'high';
  }
) {
  const skip = (page - 1) * limit;
  const filter: Record<string, unknown> = {
    userId,
  };
  if (filters.completed !== undefined) {
    filter.completed = filters.completed;
  }

  if (filters.priority !== undefined) {
    filter.priority = filters.priority;
  }
  const [todos, totalTodos] = await Promise.all([
    Todo.find(filter)
      .select('text completed priority createdAt updatedAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    Todo.countDocuments(filter),
  ]);
  return {
    data: {
      items: todos,
      page,
      limit,
      totalTodos,
    },
  };
}

export async function postTodoService(userId: string, body: TodoPostBody) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  const newTodo = await Todo.create({
    text: body.text,
    completed: body.completed,
    priority: body.priority,
    userId: userId,
  });
  return newTodo;
}

export async function putTodoService(
  userId: string,
  todoId: string,
  body: TodoPutBody
) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }
  if (!mongoose.isValidObjectId(todoId)) {
    throw new AppError('Invalid todo ID', 400, 'INVALID_TODO_ID');
  }

  const updatedTodo = await Todo.findOneAndUpdate(
    {
      _id: todoId,
      userId,
    },
    {
      $set: {
        text: body.text,
        completed: body.completed,
        priority: body.priority,
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedTodo) {
    throw new AppError('Todo not found', 404, 'TODO_NOT_FOUND');
  }

  return updatedTodo;
}

export async function deleteTodoService(userId: string, todoId: string) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }
  if (!mongoose.isValidObjectId(todoId)) {
    throw new AppError('Invalid todo ID', 400, 'INVALID_TODO_ID');
  }

  const deletedTodo = await Todo.findOneAndDelete({
    _id: todoId,
    userId,
  });

  if (!deletedTodo) {
    throw new AppError('Todo not found', 404, 'TODO_NOT_FOUND');
  }

  return deletedTodo;
}

export async function getTodoStatsService(userId: string) {
  if (!mongoose.isValidObjectId(userId)) {
    throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
  }

  const [total, completed] = await Promise.all([
    Todo.countDocuments({ userId }),

    Todo.countDocuments({
      userId,
      completed: true,
    }),
  ]);

  const pending = total - completed;

  return {
    total,
    completed,
    pending,
  };
}
