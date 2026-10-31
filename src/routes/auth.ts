import { Router } from 'express';
import {
  loginValidator,
  registrationValidator,
} from '../middleware/authValidation.js';
import { registrationLimiter } from '../middleware/registrationLimiter.js';
import {
  loginController,
  logoutController,
  refreshTokenController,
  registrationController,
  resendVerificationController,
  verifyController,
} from '../controller/authController.js';
import { validateRequest } from '../middleware/userValidation.js';

const router = Router();

router.post(
  '/register',
  registrationLimiter,
  registrationValidator,
  registrationController
);
router.get('/verify-email', verifyController);
router.post('/resend-verification', resendVerificationController);
router.post('/login', loginValidator, validateRequest, loginController);
router.post('/logout', logoutController);
router.post('/refresh', refreshTokenController);

export default router;
