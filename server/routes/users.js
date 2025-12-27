import express from 'express';
import {
  getUserProfile,
  updateUserProfile,
  updateWalletBalance,
  submitKYC,
  getUserByAnonymousId,
  getPublicProfile,
  toggleUserBan
} from '../controllers/userController.js';
import { requireAuth, requireAdmin, requireKYCVerified } from '../middleware/accessControl.js';
import User from '../models/User.js';

const router = express.Router();

// User routes (authenticated)
router.get('/profile', requireAuth, getUserProfile);
router.put('/profile', requireAuth, updateUserProfile);
router.post('/wallet', requireAuth, updateWalletBalance);
router.post('/kyc', requireAuth, submitKYC);

// Debug endpoint to check KYC status (authenticated users only)
router.get('/kyc-status', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('email kycStatus role createdAt');
    console.log('[DEBUG] KYC Status Check - User:', user.email, 'kycStatus:', user.kycStatus);
    res.json({
      success: true,
      data: {
        userId: user._id,
        email: user.email,
        kycStatus: user.kycStatus,
        role: user.role,
        createdAt: user.createdAt,
        canBid: user.kycStatus === 'verified' || user.role === 'admin',
        canSell: user.kycStatus === 'verified' || user.role === 'admin'
      },
      message: user.kycStatus === 'verified' 
        ? '✅ You can bid and sell' 
        : user.kycStatus === 'pending'
        ? '⏳ Waiting for admin approval'
        : '❌ KYC rejected - contact support'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error fetching KYC status' }
    });
  }
});

// Test endpoint to verify KYC middleware works
router.get('/test-kyc-protected', requireAuth, requireKYCVerified, (req, res) => {
  res.json({
    success: true,
    message: '✅ KYC verification passed! You can access protected routes.',
    user: {
      id: req.user._id,
      kycStatus: req.user.kycStatus
    }
  });
});

// Public routes
router.get('/anonymous/:anonymousId', getUserByAnonymousId);
router.get('/public/:anonymousId', getPublicProfile); // Public profile with stats

// Admin routes
router.put('/:userId/ban', requireAuth, requireAdmin, toggleUserBan);

export default router;
