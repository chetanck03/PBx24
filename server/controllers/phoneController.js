import Phone from '../models/Phone.js';
import User from '../models/User.js';

/**
 * Create phone listing
 */
export const createPhone = async (req, res) => {
  try {
    const {
      brand, model, storage, ram, color, imei,
      condition, images, description, minBidPrice,
      auctionStartTime, auctionEndTime
    } = req.body;
    
    // Validation
    if (!brand || !model || !storage || !imei || !condition || !images || !description || !minBidPrice) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields',
          code: 'MISSING_FIELDS'
        }
      });
    }
    
    if (!images || images.length < 1) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'At least 1 image is required',
          code: 'INSUFFICIENT_IMAGES'
        }
      });
    }
    
    if (images.length > 6) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Maximum 6 images allowed',
          code: 'TOO_MANY_IMAGES'
        }
      });
    }
    
    // Get seller's anonymous ID
    const seller = await User.findById(req.userId);
    if (!seller) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Seller not found',
          code: 'SELLER_NOT_FOUND'
        }
      });
    }
    
    // Create phone
    const phone = new Phone({
      sellerId: req.userId,
      anonymousSellerId: seller.anonymousId,
      brand,
      model,
      storage,
      ram,
      color,
      condition,
      images,
      description,
      minBidPrice,
      auctionStartTime,
      auctionEndTime,
      status: 'pending' // Pending admin verification
    });
    
    // Encrypt and set IMEI
    phone.setImei(imei);
    
    await phone.save();
    
    res.status(201).json({
      success: true,
      data: phone.toSellerObject(),
      message: 'Phone listing created successfully. Awaiting admin verification.'
    });
  } catch (error) {
    console.error('Error creating phone listing:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error creating phone listing',
        code: 'CREATE_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * Get all phones (public view)
 */
export const getAllPhones = async (req, res) => {
  try {
    const { status, brand, condition, minPrice, maxPrice } = req.query;
    
    const query = {};
    
    // Filter by status (default to live for public)
    if (status) {
      query.status = status;
    } else {
      query.status = 'live';
    }
    
    if (brand) query.brand = brand;
    if (condition) query.condition = condition;
    if (minPrice || maxPrice) {
      query.minBidPrice = {};
      if (minPrice) query.minBidPrice.$gte = Number(minPrice);
      if (maxPrice) query.minBidPrice.$lte = Number(maxPrice);
    }
    
    const phones = await Phone.find(query).sort({ createdAt: -1 });
    
    // Return public view for non-admin
    const phonesData = phones.map(phone => 
      req.userRole === 'admin' ? phone.toAdminObject() : phone.toPublicObject()
    );
    
    res.json({
      success: true,
      data: phonesData,
      count: phonesData.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching phones',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * Get phone by ID
 */
export const getPhoneById = async (req, res) => {
  try {
    const { id } = req.params;
    const phone = await Phone.findById(id);
    
    if (!phone) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Phone not found',
          code: 'PHONE_NOT_FOUND'
        }
      });
    }
    
    // Determine view based on role and ownership
    let phoneData;
    if (req.userRole === 'admin') {
      phoneData = phone.toAdminObject();
    } else if (phone.sellerId.toString() === req.userId) {
      phoneData = phone.toSellerObject();
    } else {
      phoneData = phone.toPublicObject();
    }
    
    res.json({
      success: true,
      data: phoneData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching phone',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * Get seller's phones
 */
export const getSellerPhones = async (req, res) => {
  try {
    const phones = await Phone.find({ sellerId: req.userId }).sort({ createdAt: -1 });
    
    const phonesData = phones.map(phone => phone.toSellerObject());
    
    res.json({
      success: true,
      data: phonesData,
      count: phonesData.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching seller phones',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * Update phone listing
 */
export const updatePhone = async (req, res) => {
  try {
    const { id } = req.params;
    const phone = await Phone.findById(id);
    
    if (!phone) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Phone not found',
          code: 'PHONE_NOT_FOUND'
        }
      });
    }
    
    // Check ownership (unless admin)
    if (phone.sellerId.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          code: 'NOT_OWNER'
        }
      });
    }
    
    // Update allowed fields
    const allowedUpdates = ['description', 'minBidPrice', 'images', 'auctionStartTime', 'auctionEndTime'];
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        phone[field] = req.body[field];
      }
    });
    
    await phone.save();
    
    res.json({
      success: true,
      data: phone.toSellerObject(),
      message: 'Phone listing updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error updating phone',
        code: 'UPDATE_ERROR'
      }
    });
  }
};

/**
 * Verify phone (Admin only)
 */
export const verifyPhone = async (req, res) => {
  try {
    const { id } = req.params;
    const { verificationStatus, adminNotes } = req.body;
    
    if (!['approved', 'rejected'].includes(verificationStatus)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid verification status',
          code: 'INVALID_STATUS'
        }
      });
    }
    
    const phone = await Phone.findById(id);
    
    if (!phone) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Phone not found',
          code: 'PHONE_NOT_FOUND'
        }
      });
    }
    
    phone.verificationStatus = verificationStatus;
    if (adminNotes) phone.adminNotes = adminNotes;
    
    // If approved, set status to live and create auction
    if (verificationStatus === 'approved') {
      phone.status = 'live';
      await phone.save();
      
      // Create auction automatically
      const Auction = (await import('../models/Auction.js')).default;
      const existingAuction = await Auction.findOne({ phoneId: phone._id });
      
      if (!existingAuction) {
        const auction = new Auction({
          phoneId: phone._id,
          auctionEndTime: phone.auctionEndTime,
          status: 'active'
        });
        await auction.save();
      }
    } else {
      phone.status = 'rejected';
      await phone.save();
    }
    
    res.json({
      success: true,
      data: phone.toAdminObject(),
      message: `Phone ${verificationStatus} successfully${verificationStatus === 'approved' ? ' and auction created' : ''}`
    });
  } catch (error) {
    console.error('Error verifying phone:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error verifying phone',
        code: 'VERIFY_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * Delete phone listing
 */
export const deletePhone = async (req, res) => {
  try {
    const { id } = req.params;
    const phone = await Phone.findById(id);
    
    if (!phone) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Phone not found',
          code: 'PHONE_NOT_FOUND'
        }
      });
    }
    
    // Check ownership (unless admin)
    if (phone.sellerId.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          code: 'NOT_OWNER'
        }
      });
    }
    
    // Can only delete if not live or has no bids
    if (phone.status === 'live') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete live listing',
          code: 'LISTING_LIVE'
        }
      });
    }
    
    await Phone.deleteOne({ _id: id });
    
    res.json({
      success: true,
      message: 'Phone listing deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error deleting phone',
        code: 'DELETE_ERROR'
      }
    });
  }
};

export default {
  createPhone,
  getAllPhones,
  getPhoneById,
  getSellerPhones,
  updatePhone,
  verifyPhone,
  deletePhone
};
