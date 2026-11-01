import { Router } from 'express';

import {
  getMyProfileController,
  updateMyProfileController,
  getPublicProfileController,
} from '../controller/profileController.js';

import { authenticateToken } from '../middleware/authValidation.js';
import {
  validateRequest,
  patchUserValidation,
} from '../middleware/userValidation.js';
import { paramIdValidation } from '../middleware/todoValidation.js';

const router = Router();

router.get('/', authenticateToken, getMyProfileController);

router.put(
  '/',
  authenticateToken,
  ...patchUserValidation,
  validateRequest,
  updateMyProfileController
);

router.get(
  '/:id',
  ...paramIdValidation,
  ...patchUserValidation,
  validateRequest,
  getPublicProfileController
);

export default router;
