import { Router } from 'express';
import {
  authenticateToken,
  requireEmailVerified,
} from '../middleware/authValidation.js';
import { validateRequest } from '../middleware/userValidation.js';
import {
  putTodoValidation,
  queryValidation,
  paramIdValidation,
  todoValidation,
} from '../middleware/todoValidation.js';
import {
  deleteTodoController,
  getAllTodosController,
  getTodoStatsController,
  postTodoController,
  putTodoController,
} from '../controller/todoController.js';

const router = Router();

router.get(
  '/protected/todos',
  authenticateToken,
  requireEmailVerified,
  ...queryValidation,
  validateRequest,
  getAllTodosController
);
router.post(
  '/protected/todos',
  authenticateToken,
  requireEmailVerified,
  ...todoValidation,
  validateRequest,
  postTodoController
);

router.put(
  '/protected/todos/:id',
  authenticateToken,
  requireEmailVerified,
  ...paramIdValidation,
  ...putTodoValidation,
  validateRequest,
  putTodoController
);

router.delete(
  '/protected/todos/:id',
  authenticateToken,
  requireEmailVerified,
  ...paramIdValidation,
  ...putTodoValidation,
  validateRequest,
  deleteTodoController
);
router.get(
  '/protected/todos/stats',
  authenticateToken,
  requireEmailVerified,
  getTodoStatsController
);
export default router;
