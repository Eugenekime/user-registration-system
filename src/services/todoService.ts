import Todo from '../models/Todo.js';

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
