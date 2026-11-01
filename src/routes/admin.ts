import { Router } from 'express';

import {
  authenticateToken,
  authorizeRole,
} from '../middleware/authValidation.js';
import {
  getAllUsersController,
  getUserByIdController,
  patchUserByIdController,
  putUserRoleController,
  putUserStatusController,
  getStatisticsController,
  getUserTodosController,
} from '../controller/adminController.js';
import {
  queryValidation,
  patchUserValidation,
  validateRequest,
} from '../middleware/userValidation.js';
import { paramIdValidation } from '../middleware/todoValidation.js';
import { putUserStatusValidation } from '../middleware/adminValidation.js';
import { adminWriteLimiter } from '../middleware/rateLimiters.js';

const router = Router();

router.get(
  '/users',
  authenticateToken,
  authorizeRole('admin'),
  ...queryValidation,
  validateRequest,
  getAllUsersController
);
router.get(
  '/users/:id',
  authenticateToken,
  authorizeRole('admin'),
  ...paramIdValidation,
  validateRequest,
  getUserByIdController
);
router.patch(
  '/users/:id',
  authenticateToken,
  authorizeRole('admin'),
  ...paramIdValidation,
  ...patchUserValidation,
  validateRequest,
  patchUserByIdController
);
router.put(
  '/users/:id/role',
  authenticateToken,
  authorizeRole('admin'),
  adminWriteLimiter,
  ...paramIdValidation,
  validateRequest,
  putUserRoleController
);
router.put(
  '/users/:id/status',
  authenticateToken,
  authorizeRole('admin'),
  adminWriteLimiter,
  ...paramIdValidation,
  ...putUserStatusValidation,
  validateRequest,
  putUserStatusController
);

router.get(
  '/statistics',
  authenticateToken,
  authorizeRole('admin'),
  getStatisticsController
);

router.get(
  '/users/:id/todos',
  authenticateToken,
  authorizeRole('admin'),
  ...queryValidation,
  ...paramIdValidation,
  validateRequest,
  getUserTodosController
);

export default router;
