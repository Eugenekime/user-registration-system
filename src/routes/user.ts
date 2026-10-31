import { Router } from 'express';
import { authenticateToken } from '../middleware/authValidation.js';
import {
  getUserController,
  patchUserController,
} from '../controller/userController.js';
import { patchUserValidation } from '../middleware/userValidation.js';

const router = Router();

router.get('/me', authenticateToken, getUserController);
router.patch(
  '/me',
  authenticateToken,
  patchUserValidation,
  patchUserController
);

export default router;
