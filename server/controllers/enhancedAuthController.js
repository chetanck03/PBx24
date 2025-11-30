import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { sendOTPEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../services/emailService.js';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP for signup
 */
export const sendSignupOTP = async (req, res) => {
  try {
    const { email, name } = req.body;
    
    if (!email || !name) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email and name are required',
          code: 'MISSING_FIELDS'
        }
      });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'User with this email already exists',
          code: 'USER_EXISTS'
        }
      });
    }
    
    // Generate OTP
    const otp = generateOTP();
    
    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email: email.toLowerCase(), type: 'signup' });
    
    // Save OTP
    const otpDoc = new OTP({
      email: email.toLowerCase(),
      otp,
      type: 'signup'
    });
    await otpDoc.save();
    
    // Send email
    await sendOTPEmail(email, otp, name);
    
    res.json({
      success: true,
      message: 'OTP sent to your email',
      data: {
        email: email.toLowerCase()
      }
    });
  } catch (error) {
    console.error('Send signup OTP error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to send OTP',
        code: 'OTP_SEND_ERROR'
      }
    });
  }
};

/**
 * Verify OTP and create account
 */
export const verifySignupOTP = async (req, res) => {
  try {
    const { email, otp, name, password } = req.body;
    
    if (!email || !otp || !name || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'All fields are required',
          code: 'MISSING_FIELDS'
        }
      });
    }
    
    // Find OTP
    const otpDoc = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      type: 'signup',
      verified: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid or expired OTP',
          code: 'INVALID_OTP'
        }
      });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create user
    const user = new User({
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
      googleId: 'email-' + Date.now() // Placeholder for non-Google users
    });
    
    await user.save();
    
    // Mark OTP as verified
    otpDoc.verified = true;
    await otpDoc.save();
    
    // Send welcome email
    await sendWelcomeEmail(email, name);
    
    // Generate token
    const token = generateToken(user._id);
    
    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      data: {
        token,
        user: user.toFullObject()
      }
    });
  } catch (error) {
    console.error('Verify signup OTP error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to create account',
        code: 'SIGNUP_ERROR'
      }
    });
  }
};

/**
 * Login with email and password
 */
export const loginWithEmail = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email and password are required',
          code: 'MISSING_FIELDS'
        }
      });
    }
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user || !user.password) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }
    
    // Check if user is banned
    if (user.isBanned) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Your account has been banned',
          code: 'ACCOUNT_BANNED'
        }
      });
    }
    
    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        }
      });
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: user.toFullObject()
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Login failed',
        code: 'LOGIN_ERROR'
      }
    });
  }
};

/**
 * Send OTP for password reset
 */
export const sendResetOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Email is required',
          code: 'MISSING_EMAIL'
        }
      });
    }
    
    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // Don't reveal if user exists or not
      return res.json({
        success: true,
        message: 'If an account exists, an OTP has been sent'
      });
    }
    
    // Generate OTP
    const otp = generateOTP();
    
    // Delete any existing reset OTPs
    await OTP.deleteMany({ email: email.toLowerCase(), type: 'reset' });
    
    // Save OTP
    const otpDoc = new OTP({
      email: email.toLowerCase(),
      otp,
      type: 'reset'
    });
    await otpDoc.save();
    
    // Send email
    await sendOTPEmail(email, otp, user.name);
    
    res.json({
      success: true,
      message: 'OTP sent to your email'
    });
  } catch (error) {
    console.error('Send reset OTP error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to send OTP',
        code: 'OTP_SEND_ERROR'
      }
    });
  }
};

/**
 * Verify OTP and reset password
 */
export const verifyResetOTP = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    
    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'All fields are required',
          code: 'MISSING_FIELDS'
        }
      });
    }
    
    // Find OTP
    const otpDoc = await OTP.findOne({
      email: email.toLowerCase(),
      otp,
      type: 'reset',
      verified: false,
      expiresAt: { $gt: new Date() }
    });
    
    if (!otpDoc) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid or expired OTP',
          code: 'INVALID_OTP'
        }
      });
    }
    
    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }
    
    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();
    
    // Mark OTP as verified
    otpDoc.verified = true;
    await otpDoc.save();
    
    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Verify reset OTP error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to reset password',
        code: 'RESET_ERROR'
      }
    });
  }
};

export default {
  sendSignupOTP,
  verifySignupOTP,
  loginWithEmail,
  sendResetOTP,
  verifyResetOTP
};
