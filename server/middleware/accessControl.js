import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Middleware for optional authentication (doesn't fail if no token)
 * Sets req.userId and req.userRole if token is valid, otherwise continues without them
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      // No token, continue without authentication
      return next();
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (user && user.isActive && !user.isBanned) {
      req.user = user;
      req.userId = user._id.toString();
      req.userRole = user.role;
    }
    
    next();
  } catch (error) {
    // Invalid token, continue without authentication
    next();
  }
};

/**
 * Middleware to require authentication
 */
export const requireAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Authentication required',
          code: 'AUTH_REQUIRED'
        }
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    
    if (!user || !user.isActive || user.isBanned) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid or inactive user',
          code: 'INVALID_USER'
        }
      });
    }
    
    req.user = user;
    req.userId = user._id.toString();
    req.userRole = user.role;
    
    console.log('[AUTH] User authenticated:', user._id, 'kycStatus:', user.kycStatus);
    
    next();
  } catch (error) {
    console.error('[AUTH] Authentication error:', error.message);
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid authentication token',
        code: 'INVALID_TOKEN'
      }
    });
  }
};

/**
 * Middleware to require admin role
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.userRole !== 'admin') {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Access denied. Admin privileges required.',
        code: 'ADMIN_REQUIRED'
      }
    });
  }
  next();
};

/**
 * Middleware to require seller role
 * Note: All authenticated users (user, admin) can both buy and sell
 */
export const requireSeller = (req, res, next) => {
  if (!req.user) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Access denied. Authentication required.',
        code: 'AUTH_REQUIRED'
      }
    });
  }
  // All authenticated users can create listings
  next();
};

/**
 * Middleware to require KYC verification
 * User must be verified by admin before they can place bids or sell phones
 */
export const requireKYCVerified = async (req, res, next) => {
  if (!req.user) {
    console.log('[KYC] No user in request');
    return res.status(401).json({
      success: false,
      error: {
        message: 'Authentication required',
        code: 'AUTH_REQUIRED'
      }
    });
  }

  console.log('[KYC] Checking KYC for user:', req.user._id, 'current kycStatus:', req.user.kycStatus);

  // Admin users bypass KYC check
  if (req.user.role === 'admin') {
    console.log('[KYC] Admin user - bypassing KYC check');
    return next();
  }

  // IMPORTANT: Fetch fresh user data from database to get latest kycStatus
  // This ensures we don't use stale data from the token/session
  try {
    const freshUser = await User.findById(req.user._id).select('kycStatus role email');
    if (freshUser) {
      req.user.kycStatus = freshUser.kycStatus;
      console.log('[KYC] Fresh kycStatus fetched for user', req.user._id, '(', freshUser.email, '):', freshUser.kycStatus);
    } else {
      console.error('[KYC] User not found in database:', req.user._id);
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }
  } catch (err) {
    console.error('[KYC] Error fetching fresh user data:', err.message);
    // Continue with existing kycStatus if fetch fails
  }

  // Check if user's KYC is verified
  if (req.user.kycStatus !== 'verified') {
    console.log('[KYC] ❌ User BLOCKED - kycStatus:', req.user.kycStatus, 'userId:', req.user._id);
    const statusMessages = {
      'pending': 'Your account is under verification. Please wait for admin approval before placing bids.',
      'rejected': 'Your KYC verification was rejected. Please contact support or re-submit your documents.'
    };

    return res.status(403).json({
      success: false,
      error: {
        message: statusMessages[req.user.kycStatus] || 'KYC verification required to place bids',
        code: 'KYC_NOT_VERIFIED',
        kycStatus: req.user.kycStatus
      }
    });
  }

  console.log('[KYC] ✅ User ALLOWED - kycStatus: verified, userId:', req.user._id);
  next();
};

/**
 * Filter sensitive data based on user role and ownership
 * @param {Object} data - Data to filter
 * @param {String} userRole - Role of requesting user
 * @param {String} userId - ID of requesting user
 * @param {String} ownerId - ID of data owner (optional)
 * @returns {Object} Filtered data
 */
export const filterSensitiveData = (data, userRole, userId, ownerId = null) => {
  // Admin gets full access
  if (userRole === 'admin') {
    return data;
  }
  
  // Owner gets full access to their own data
  if (ownerId && userId === ownerId) {
    return data;
  }
  
  // Non-admin, non-owner gets limited access
  // Remove real IDs and encrypted fields
  const filtered = { ...data };
  
  // Remove sensitive fields
  delete filtered.sellerId;
  delete filtered.buyerId;
  delete filtered.bidderId;
  delete filtered.leadingBidderId;
  delete filtered.winnerId;
  delete filtered.phone;
  delete filtered.address;
  delete filtered.imei;
  delete filtered.googleId;
  delete filtered.email;
  
  return filtered;
};

/**
 * Middleware to filter response data based on role
 */
export const filterResponse = (getOwnerIdFn = null) => {
  return (req, res, next) => {
    const originalJson = res.json.bind(res);
    
    res.json = (data) => {
      if (data && data.success !== false) {
        const userRole = req.userRole || 'user';
        const userId = req.userId;
        
        // Determine owner ID if function provided
        let ownerId = null;
        if (getOwnerIdFn && typeof getOwnerIdFn === 'function') {
          ownerId = getOwnerIdFn(data);
        }
        
        // Filter data based on role
        if (Array.isArray(data)) {
          data = data.map(item => filterSensitiveData(item, userRole, userId, ownerId));
        } else if (typeof data === 'object') {
          data = filterSensitiveData(data, userRole, userId, ownerId);
        }
      }
      
      return originalJson(data);
    };
    
    next();
  };
};

/**
 * Check if user is owner of resource
 */
export const isOwner = (resourceOwnerId, userId) => {
  return resourceOwnerId && userId && resourceOwnerId.toString() === userId.toString();
};

/**
 * Middleware to check resource ownership
 */
export const requireOwnership = (getOwnerIdFn) => {
  return async (req, res, next) => {
    try {
      const ownerId = await getOwnerIdFn(req);
      
      if (!isOwner(ownerId, req.userId) && req.userRole !== 'admin') {
        return res.status(403).json({
          success: false,
          error: {
            message: 'Access denied. You do not own this resource.',
            code: 'NOT_OWNER'
          }
        });
      }
      
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: {
          message: 'Error checking ownership',
          code: 'OWNERSHIP_CHECK_FAILED'
        }
      });
    }
  };
};

export default {
  optionalAuth,
  requireAuth,
  requireAdmin,
  requireSeller,
  requireKYCVerified,
  filterSensitiveData,
  filterResponse,
  isOwner,
  requireOwnership
};
