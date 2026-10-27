import { Router } from 'express';
import {
  loginValidator,
  registrationValidator,
} from '../middleware/authValidation.js';
import { registrationLimiter } from '../middleware/registrationLimiter.js';
import {
  loginController,
  refreshTokenController,
  registrationController,
  resendVerificationController,
  verifyController,
} from '../controller/authController.js';

const router = Router();

router.post(
  '/register',
  registrationLimiter,
  registrationValidator,
  registrationController
);
router.get('/verify-email', verifyController);
router.post('/resend-verification', resendVerificationController);
router.post('/login', loginValidator, loginController);
router.post('/refresh', refreshTokenController);

export default router;
