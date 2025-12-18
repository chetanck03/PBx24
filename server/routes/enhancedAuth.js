import express from 'express';
import {
  sendSignupOTP,
  verifySignupOTP,
  loginWithEmail,
  sendResetOTP,
  verifyResetOTP
} from '../controllers/enhancedAuthController.js';

const router = express.Router();

// Email config test endpoint (for debugging)
router.get('/test-email-config', (req, res) => {
  const config = {
    EMAIL_USER_SET: !!process.env.EMAIL_USER,
    EMAIL_PASS_SET: !!process.env.EMAIL_PASS,
    EMAIL_USER_PREVIEW: process.env.EMAIL_USER ? process.env.EMAIL_USER.substring(0, 5) + '***' : 'NOT SET',
    EMAIL_PASS_LENGTH: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 0,
    NODE_ENV: process.env.NODE_ENV || 'not set',
    MONGODB_URI_SET: !!process.env.MONGODB_URI
  };
  console.log('[TEST] Email config check:', config);
  res.json({ success: true, config });
});

// Signup flow
router.post('/signup/send-otp', sendSignupOTP);
router.post('/signup/verify-otp', verifySignupOTP);

// Login
router.post('/login', loginWithEmail);

// Password reset flow
router.post('/forgot-password', sendResetOTP);
router.post('/reset-password', verifyResetOTP);

export default router;
