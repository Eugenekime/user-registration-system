import { Router } from 'express';
import {
  loginValidator,
  registrationValidator,
} from '../middleware/authValidation.js';
import {
  loginController,
  logoutController,
  refreshTokenController,
  registrationController,
  resendVerificationController,
  verifyController,
} from '../controller/authController.js';
import { validateRequest } from '../middleware/userValidation.js';
import { authLimiter } from '../middleware/rateLimiters.js';

const router = Router();

router.post(
  '/register',
  authLimiter,
  registrationValidator,
  registrationController
);
router.get('/verify-email', verifyController);
router.post('/resend-verification', authLimiter, resendVerificationController);
router.post(
  '/login',
  authLimiter,
  loginValidator,
  validateRequest,
  loginController
);
router.post('/logout', logoutController);
router.post('/refresh', authLimiter, refreshTokenController);

export default router;
