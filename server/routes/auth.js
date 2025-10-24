import express from 'express';
import { googleAuth, getProfile, logout } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/google', googleAuth);
router.get('/me', authenticateToken, getProfile);
router.post('/logout', logout);

export default router;