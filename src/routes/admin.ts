import { Router } from 'express';
import {
  authenticateToken,
  authorizeRole,
} from '../middleware/authValidation.js';
import {
  getAllUsersController,
  getUserByIdController,
} from '../controller/adminController.js';
import { patchUserValidation } from '../middleware/userValidation.js';

const router = Router();

router.get(
  '/users',
  authenticateToken,
  authorizeRole('admin'),
  getAllUsersController
);
router.get(
  '/users:id',
  authenticateToken,
  authorizeRole('admin'),
  getUserByIdController
);
router.patch(
  '/users:id',
  authenticateToken,
  authorizeRole('admin'),
  patchUserValidation
);

export default router;
