import { Router } from 'express';
import { authenticateToken } from '../middleware/authValidation.js';

const router = Router();

router.get('/me', authenticateToken);
