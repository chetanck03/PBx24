import Phone from '../models/Phone.js';
import User from '../models/User.js';
import { invalidatePhoneCache, deleteCachePattern, getCache, setCache, cacheKeys, CACHE_TTL } from '../services/redisService.js';

/**
 * Create phone listing
 */
export const createPhone = async (req, res) => {
  try {
    const {
      brand, model, storage, ram, color, imei,
      condition, images, description, minBidPrice,
      auctionStartTime, auctionEndTime, location
    } = req.body;
    
    // Validation - minBidPrice is no longer required (defaults to ₹1)
    if (!brand || !model || !storage || !imei || !condition || !images || !description || !location) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Missing required fields (including location)',
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
      minBidPrice: minBidPrice || 1, // Default to ₹1 - buyers decide the price
      auctionStartTime,
      auctionEndTime,
      location,
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
 * Get all phones (public view) - OPTIMIZED with Redis caching
 */
export const getAllPhones = async (req, res) => {
  try {
    const { status, brand, condition, minPrice, maxPrice, location, state, city } = req.query;
    
    // Generate cache key based on query params
    const cacheKey = `phones:list:${status || 'live'}:${brand || ''}:${condition || ''}:${minPrice || ''}:${maxPrice || ''}:${location || ''}:${state || ''}:${city || ''}`;
    
    // Try to get from cache first (skip for admin)
    if (req.userRole !== 'admin') {
      const cached = await getCache(cacheKey);
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          count: cached.length,
          cached: true
        });
      }
    }
    
    const query = {};
    
    // Filter by status (default to live for public)
    if (status) {
      query.status = status;
    } else {
      query.status = 'live';
    }
    
    if (brand) query.brand = brand;
    if (condition) query.condition = condition;
    
    // Location filter - supports city, state, or combined search
    if (location || state || city) {
      const locationConditions = [];
      
      if (location) {
        locationConditions.push({ location: { $regex: location, $options: 'i' } });
      }
      
      if (state) {
        locationConditions.push({ location: { $regex: state, $options: 'i' } });
      }
      
      if (city) {
        locationConditions.push({ location: { $regex: city, $options: 'i' } });
      }
      
      if (locationConditions.length > 1) {
        query.$and = locationConditions;
      } else if (locationConditions.length === 1) {
        query.location = locationConditions[0].location;
      }
    }
    
    if (minPrice || maxPrice) {
      query.minBidPrice = {};
      if (minPrice) query.minBidPrice.$gte = Number(minPrice);
      if (maxPrice) query.minBidPrice.$lte = Number(maxPrice);
    }
    
    // Use lean() for faster queries - returns plain JS objects
    const phones = await Phone.find(query).sort({ createdAt: -1 }).lean();
    
    // Return public view for non-admin
    const phonesData = phones.map(phone => {
      if (req.userRole === 'admin') {
        return phone; // Already lean object
      }
      // Return public fields only
      return {
        _id: phone._id,
        anonymousSellerId: phone.anonymousSellerId,
        brand: phone.brand,
        model: phone.model,
        storage: phone.storage,
        ram: phone.ram,
        color: phone.color,
        condition: phone.condition,
        accessories: phone.accessories,
        images: phone.images,
        description: phone.description,
        minBidPrice: phone.minBidPrice,
        auctionStartTime: phone.auctionStartTime,
        auctionEndTime: phone.auctionEndTime,
        status: phone.status,
        location: phone.location,
        createdAt: phone.createdAt
      };
    });
    
    // Cache the result for 30 seconds (non-admin only)
    if (req.userRole !== 'admin') {
      setCache(cacheKey, phonesData, CACHE_TTL.MARKETPLACE).catch(() => {});
    }
    
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
 * Get phone by ID - OPTIMIZED with Redis caching
 */
export const getPhoneById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Try cache first for public view
    if (req.userRole !== 'admin' && !req.userId) {
      const cached = await getCache(cacheKeys.phone(id));
      if (cached) {
        return res.json({
          success: true,
          data: cached,
          cached: true
        });
      }
    }
    
    const phone = await Phone.findById(id).lean();
    
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
      phoneData = phone;
    } else if (phone.sellerId?.toString() === req.userId) {
      phoneData = phone;
    } else {
      // Public view - exclude sensitive fields
      phoneData = {
        _id: phone._id,
        anonymousSellerId: phone.anonymousSellerId,
        brand: phone.brand,
        model: phone.model,
        storage: phone.storage,
        ram: phone.ram,
        color: phone.color,
        condition: phone.condition,
        accessories: phone.accessories,
        images: phone.images,
        description: phone.description,
        minBidPrice: phone.minBidPrice,
        auctionStartTime: phone.auctionStartTime,
        auctionEndTime: phone.auctionEndTime,
        status: phone.status,
        location: phone.location,
        createdAt: phone.createdAt
      };
      
      // Cache public view
      setCache(cacheKeys.phone(id), phoneData, CACHE_TTL.PHONE).catch(() => {});
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
 * Get seller's phones (excludes sold phones - they have their own endpoint)
 */
export const getSellerPhones = async (req, res) => {
  try {
    // Exclude sold phones - they appear in the "Sold Phones" tab
    const phones = await Phone.find({ 
      sellerId: req.userId,
      status: { $ne: 'sold' }
    }).sort({ createdAt: -1 });
    
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
    
    let auction = null;
    
    // If approved, set status to live and create auction
    if (verificationStatus === 'approved') {
      phone.status = 'live';
      await phone.save();
      
      // Create auction automatically
      const Auction = (await import('../models/Auction.js')).default;
      const existingAuction = await Auction.findOne({ phoneId: phone._id });
      
      if (!existingAuction) {
        const auctionEndTime = phone.auctionEndTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        auction = new Auction({
          phoneId: phone._id,
          sellerId: phone.sellerId,
          anonymousSellerId: phone.anonymousSellerId,
          startingBid: phone.minBidPrice,
          currentBid: 0,
          auctionEndTime: auctionEndTime,
          status: 'active'
        });
        await auction.save();
      } else {
        auction = existingAuction;
      }
      
      // Invalidate marketplace cache so new listing appears immediately
      deleteCachePattern('marketplace:*').catch(() => {});
      invalidatePhoneCache(id).catch(() => {});
      
      // Emit WebSocket event for real-time marketplace update
      const io = req.app.get('io');
      if (io) {
        const newListingData = {
          phone: phone.toPublicObject(),
          auction: auction ? {
            _id: auction._id,
            currentBid: auction.currentBid,
            totalBids: auction.totalBids || 0,
            auctionEndTime: auction.auctionEndTime,
            status: auction.status
          } : null
        };
        // Emit to all connected clients
        io.emit('new_listing', newListingData);
        // Also emit to marketplace room if exists
        io.to('marketplace').emit('new_listing', newListingData);
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

/**
 * Get seller's sold phones (phones that have been sold)
 */
export const getSoldPhones = async (req, res) => {
  try {
    // Find phones owned by this seller that are sold
    const phones = await Phone.find({ 
      sellerId: req.userId, 
      status: 'sold' 
    }).sort({ updatedAt: -1 });
    
    // Get auction details for each phone
    const Auction = (await import('../models/Auction.js')).default;
    const phonesWithAuction = await Promise.all(phones.map(async (phone) => {
      const auction = await Auction.findOne({ phoneId: phone._id, status: 'ended' });
      return {
        ...phone.toSellerObject(),
        soldPrice: auction?.currentBid || phone.minBidPrice,
        soldAt: auction?.updatedAt || phone.updatedAt,
        buyerAnonymousId: auction?.anonymousLeadingBidder || 'N/A'
      };
    }));
    
    res.json({
      success: true,
      data: phonesWithAuction,
      count: phonesWithAuction.length
    });
  } catch (error) {
    console.error('Error fetching sold phones:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching sold phones',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * Get user's purchased phones (auctions won by user)
 */
export const getPurchasedPhones = async (req, res) => {
  try {
    const Auction = (await import('../models/Auction.js')).default;
    const { encrypt } = await import('../services/encryptionService.js');
    
    // Find all ended auctions
    const endedAuctions = await Auction.find({ status: 'ended' }).populate('phoneId');
    
    // Filter auctions where this user is the winner
    const wonAuctions = endedAuctions.filter(auction => {
      try {
        const winnerId = auction.getWinnerId();
        return winnerId === req.userId;
      } catch (error) {
        return false;
      }
    });
    
    // Map to phone data with purchase details
    const purchasedPhones = wonAuctions.map(auction => {
      const phone = auction.phoneId;
      if (!phone) return null;
      
      return {
        _id: phone._id,
        brand: phone.brand,
        model: phone.model,
        storage: phone.storage,
        ram: phone.ram,
        color: phone.color,
        condition: phone.condition,
        images: phone.images,
        description: phone.description,
        location: phone.location,
        purchasePrice: auction.currentBid,
        purchasedAt: auction.updatedAt,
        sellerAnonymousId: auction.anonymousSellerId,
        auctionId: auction._id
      };
    }).filter(Boolean);
    
    res.json({
      success: true,
      data: purchasedPhones,
      count: purchasedPhones.length
    });
  } catch (error) {
    console.error('Error fetching purchased phones:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching purchased phones',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * Get marketplace phones with auctions - OPTIMIZED single call
 */
export const getMarketplacePhones = async (req, res) => {
  try {
    const { brand, condition, storage, ram, minPrice, maxPrice, location, state, city } = req.query;
    
    // Generate cache key
    const cacheKey = `marketplace:${brand || ''}:${condition || ''}:${storage || ''}:${ram || ''}:${minPrice || ''}:${maxPrice || ''}:${location || ''}:${state || ''}:${city || ''}`;
    
    // Try cache first
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        count: cached.length,
        cached: true
      });
    }
    
    // Build query
    const query = { status: 'live' };
    if (brand) query.brand = brand;
    if (condition) query.condition = condition;
    if (storage) query.storage = storage;
    if (ram) query.ram = ram;
    
    // Location filter
    if (location || state || city) {
      const locationConditions = [];
      if (location) locationConditions.push({ location: { $regex: location, $options: 'i' } });
      if (state) locationConditions.push({ location: { $regex: state, $options: 'i' } });
      if (city) locationConditions.push({ location: { $regex: city, $options: 'i' } });
      
      if (locationConditions.length > 1) {
        query.$and = locationConditions;
      } else if (locationConditions.length === 1) {
        query.location = locationConditions[0].location;
      }
    }
    
    // Get phones with lean() for speed
    const phones = await Phone.find(query).sort({ createdAt: -1 }).lean();
    
    // Get all auctions for these phones in a single query
    const Auction = (await import('../models/Auction.js')).default;
    const phoneIds = phones.map(p => p._id);
    const auctions = await Auction.find({ 
      phoneId: { $in: phoneIds },
      status: 'active'
    }).lean();
    
    // Create auction map for quick lookup
    const auctionMap = {};
    auctions.forEach(auction => {
      auctionMap[auction.phoneId.toString()] = {
        _id: auction._id,
        currentBid: auction.currentBid,
        totalBids: auction.totalBids,
        auctionEndTime: auction.auctionEndTime,
        status: auction.status,
        anonymousLeadingBidder: auction.anonymousLeadingBidder
      };
    });
    
    // Combine phones with their auctions
    const result = phones.map(phone => ({
      _id: phone._id,
      anonymousSellerId: phone.anonymousSellerId,
      brand: phone.brand,
      model: phone.model,
      storage: phone.storage,
      ram: phone.ram,
      color: phone.color,
      condition: phone.condition,
      accessories: phone.accessories,
      images: phone.images,
      description: phone.description,
      minBidPrice: phone.minBidPrice,
      auctionEndTime: phone.auctionEndTime,
      status: phone.status,
      location: phone.location,
      createdAt: phone.createdAt,
      auction: auctionMap[phone._id.toString()] || null
    }));
    
    // Cache for 30 seconds
    setCache(cacheKey, result, CACHE_TTL.MARKETPLACE).catch(() => {});
    
    res.json({
      success: true,
      data: result,
      count: result.length
    });
  } catch (error) {
    console.error('Error fetching marketplace:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching marketplace',
        code: 'FETCH_ERROR'
      }
    });
  }
};

export default {
  createPhone,
  getAllPhones,
  getPhoneById,
  getSellerPhones,
  getSoldPhones,
  getPurchasedPhones,
  updatePhone,
  verifyPhone,
  deletePhone,
  getMarketplacePhones
};
