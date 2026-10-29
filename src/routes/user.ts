import { Router } from 'express';
import { authenticateToken } from '../middleware/authValidation.js';
import { getUserController } from '../controller/userController.js';
import { userPatchValidation } from '../middleware/userValidation.js';

const router = Router();

router.get('/me', authenticateToken, getUserController);
router.patch('/me', authenticateToken, userPatchValidation);

export default router;
