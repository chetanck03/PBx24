import User from '../models/User.js';

/**
 * Get user profile
 */
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }
    
    // Return full object for self-access
    res.json({
      success: true,
      data: user.toFullObject()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching user profile',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (req, res) => {
  try {
    const { name, avatar, phone, address, role } = req.body;
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }
    
    // Update basic fields
    if (name) user.name = name;
    if (avatar) user.avatar = avatar;
    if (role && ['buyer', 'seller'].includes(role)) user.role = role;
    
    // Update encrypted fields
    if (phone) user.setPhone(phone);
    if (address) user.setAddress(address);
    
    await user.save();
    
    res.json({
      success: true,
      data: user.toFullObject(),
      message: 'Profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error updating profile',
        code: 'UPDATE_ERROR'
      }
    });
  }
};

/**
 * Update wallet balance
 */
export const updateWalletBalance = async (req, res) => {
  try {
    const { amount, operation } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid amount',
          code: 'INVALID_AMOUNT'
        }
      });
    }
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }
    
    if (operation === 'add') {
      user.walletBalance += amount;
    } else if (operation === 'subtract') {
      if (user.walletBalance < amount) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Insufficient balance',
            code: 'INSUFFICIENT_BALANCE'
          }
        });
      }
      user.walletBalance -= amount;
    } else {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid operation. Use "add" or "subtract"',
          code: 'INVALID_OPERATION'
        }
      });
    }
    
    await user.save();
    
    res.json({
      success: true,
      data: {
        walletBalance: user.walletBalance
      },
      message: 'Wallet balance updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error updating wallet balance',
        code: 'UPDATE_ERROR'
      }
    });
  }
};

/**
 * Submit KYC information
 */
export const submitKYC = async (req, res) => {
  try {
    const { kycData } = req.body;
    
    if (!kycData) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'KYC data is required',
          code: 'KYC_DATA_REQUIRED'
        }
      });
    }
    
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }
    
    // Set KYC status to pending
    user.kycStatus = 'pending';
    await user.save();
    
    res.json({
      success: true,
      data: {
        kycStatus: user.kycStatus
      },
      message: 'KYC submitted successfully. Awaiting admin review.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error submitting KYC',
        code: 'SUBMIT_ERROR'
      }
    });
  }
};

/**
 * Get user by anonymous ID (public view)
 */
export const getUserByAnonymousId = async (req, res) => {
  try {
    const { anonymousId } = req.params;
    const user = await User.findOne({ anonymousId });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }
    
    // Return safe object (only anonymous info)
    res.json({
      success: true,
      data: user.toSafeObject()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching user',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * Ban/Unban user (Admin only)
 */
export const toggleUserBan = async (req, res) => {
  try {
    const { userId } = req.params;
    const { isBanned } = req.body;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }
    
    user.isBanned = isBanned;
    await user.save();
    
    res.json({
      success: true,
      data: user.toFullObject(),
      message: `User ${isBanned ? 'banned' : 'unbanned'} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error updating user ban status',
        code: 'UPDATE_ERROR'
      }
    });
  }
};

export default {
  getUserProfile,
  updateUserProfile,
  updateWalletBalance,
  submitKYC,
  getUserByAnonymousId,
  toggleUserBan
};
