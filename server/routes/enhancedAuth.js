import express from 'express';
import {
  sendSignupOTP,
  verifySignupOTP,
  loginWithEmail,
  sendResetOTP,
  verifyResetOTP
} from '../controllers/enhancedAuthController.js';

const router = express.Router();

// Signup flow
router.post('/signup/send-otp', sendSignupOTP);
router.post('/signup/verify-otp', verifySignupOTP);

// Login
router.post('/login', loginWithEmail);

// Password reset flow
router.post('/forgot-password', sendResetOTP);
router.post('/reset-password', verifyResetOTP);

export default router;
