import jwt from 'jsonwebtoken';
import User from '../models/User.js';

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
    next();
  } catch (error) {
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
  requireAuth,
  requireAdmin,
  requireSeller,
  filterSensitiveData,
  filterResponse,
  isOwner,
  requireOwnership
};
