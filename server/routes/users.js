import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  updateWalletBalance,
  submitKYC,
  getUserByAnonymousId,
  toggleUserBan
} from '../controllers/userController.js';
import { requireAuth, requireAdmin } from '../middleware/accessControl.js';

const router = express.Router();

// User routes (authenticated)
router.get('/profile', requireAuth, getUserProfile);
router.put('/profile', requireAuth, updateUserProfile);
router.post('/wallet', requireAuth, updateWalletBalance);
router.post('/kyc', requireAuth, submitKYC);

// Public routes
router.get('/anonymous/:anonymousId', getUserByAnonymousId);

// Admin routes
router.put('/:userId/ban', requireAuth, requireAdmin, toggleUserBan);

export default router;
