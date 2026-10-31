import { Router } from 'express';

import {
  authenticateToken,
  authorizeRole,
} from '../middleware/authValidation.js';
import {
  getAllUsersController,
  getUserByIdController,
  patchUserByIdController,
} from '../controller/adminController.js';
import {
  queryValidation,
  patchUserValidation,
  validateRequest,
} from '../middleware/userValidation.js';

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
  getUserByIdController
);
router.patch(
  '/users/:id',
  authenticateToken,
  authorizeRole('admin'),
  patchUserValidation,
  validateRequest,
  patchUserByIdController
);

export default router;
