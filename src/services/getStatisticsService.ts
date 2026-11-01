import User from '../models/User.js';
import Todo from '../models/Todo.js';

export async function getStatisticsService() {
  const [
    usersByRole,
    activeUsers,
    deactivatedUsers,
    totalTodos,
    completedTodos,
    pendingTodos,
  ] = await Promise.all([
    User.aggregate([
      { $unwind: '$roles' },
      {
        $group: {
          _id: '$roles',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          role: '$_id',
          count: 1,
        },
      },
    ]),

    User.countDocuments({ isActive: true }),
    User.countDocuments({ isActive: false }),

    Todo.countDocuments(),
    Todo.countDocuments({ completed: true }),
    Todo.countDocuments({ completed: false }),
  ]);

  return {
    users: {
      byRole: usersByRole,
      active: activeUsers,
      deactivated: deactivatedUsers,
      total: activeUsers + deactivatedUsers,
    },

    todos: {
      total: totalTodos,
      completed: completedTodos,
      pending: pendingTodos,
    },

    generatedAt: new Date(),
  };
}
