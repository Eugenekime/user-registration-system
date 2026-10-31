import { Router } from 'express';
import {
  authenticateToken,
  requireEmailVerified,
} from '../middleware/authValidation.js';
import { validateRequest } from '../middleware/userValidation.js';
import {
  queryValidation,
  todoValidation,
} from '../middleware/todoValidation.js';
import { getAllTodosController } from '../controller/todoController.js';

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
  validateRequest
);

export default router;
