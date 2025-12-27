import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Google OAuth login/register
export const googleAuth = async (req, res) => {
  try {
    const { googleId, email, name, avatar } = req.body;

    if (!googleId || !email || !name) {
      return res.status(400).json({
        success: false,
        error: { message: 'Missing required Google OAuth data' }
      });
    }

    // Check if user exists
    let user = await User.findOne({ googleId });

    if (!user) {
      // Check if user exists with same email (regular registration)
      user = await User.findOne({ email });
      
      if (user) {
        // User exists with email but not Google ID - link the accounts
        user.googleId = googleId;
        user.name = name;
        user.avatar = avatar || user.avatar;
        await user.save();
      } else {
        // User doesn't exist - return error asking to complete registration/KYC first
        return res.status(403).json({
          success: false,
          error: { 
            message: 'Account not found. Please complete registration and KYC verification first.',
            code: 'ACCOUNT_NOT_FOUND',
            requiresRegistration: true,
            userData: {
              email,
              name,
              avatar,
              googleId
            }
          }
        });
      }
    } else {
      // Update existing user info
      user.name = name;
      user.avatar = avatar || user.avatar;
      await user.save();
    }

    // Check if user has completed KYC
    if (user.kycStatus !== 'verified') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Please complete your KYC verification to continue.',
          code: 'KYC_REQUIRED',
          requiresKyc: true,
          kycStatus: user.kycStatus,
          userData: {
            id: user._id,
            email: user.email,
            name: user.name,
            avatar: user.avatar,
            kycStatus: user.kycStatus
          }
        }
      });
    }

    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          _id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          anonymousId: user.anonymousId,
          kycStatus: user.kycStatus
        }
      }
    });
  } catch (error) {
    console.error('Google auth error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Authentication failed' }
    });
  }
};

// Get current user profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-googleId');

    res.json({
      success: true,
      data: {
        user: {
          id: user._id,
          _id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          anonymousId: user.anonymousId,
          kycStatus: user.kycStatus,
          walletBalance: user.walletBalance,
          isActive: user.isActive,
          createdAt: user.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get user profile' }
    });
  }
};

// Google OAuth registration - creates account and requires KYC
export const googleRegister = async (req, res) => {
  try {
    const { googleId, email, name, avatar, governmentIdProof, governmentIdType } = req.body;

    if (!googleId || !email || !name) {
      return res.status(400).json({
        success: false,
        error: { message: 'Missing required Google OAuth data' }
      });
    }

    // Check if user already exists
    let existingUser = await User.findOne({ 
      $or: [{ googleId }, { email }] 
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: { message: 'Account already exists. Please try logging in instead.' }
      });
    }

    // Create new user with pending KYC status
    const user = new User({
      googleId,
      email,
      name,
      avatar: avatar || '',
      kycStatus: 'pending',
      governmentIdProof: governmentIdProof || '',
      governmentIdType: governmentIdType || ''
    });
    await user.save();

    // Generate token for the new user
    const token = generateToken(user._id);

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          _id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          anonymousId: user.anonymousId,
          kycStatus: user.kycStatus
        },
        message: 'Account created successfully. Please wait for KYC verification.',
        requiresKyc: true
      }
    });
  } catch (error) {
    console.error('Google registration error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Registration failed' }
    });
  }
};

// Logout (client-side token removal)
export const logout = (req, res) => {
  res.json({
    success: true,
    data: { message: 'Logged out successfully' }
  });
};