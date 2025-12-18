import User from '../models/User.js';
import Phone from '../models/Phone.js';
import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import Transaction from '../models/Transaction.js';
import cache from '../utils/cache.js';

/**
 * Get all users with full decrypted data - OPTIMIZED
 */
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 100, role, kycStatus } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (role) filter.role = role;
    if (kycStatus) filter.kycStatus = kycStatus;
    
    // Use Promise.all for parallel execution
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('_id email name avatar role anonymousId walletBalance kycStatus isActive isBanned governmentIdType governmentIdProof createdAt updatedAt')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      User.countDocuments(filter)
    ]);
    
    // Fast mapping with error handling
    const usersData = users.map(user => {
      try {
        return user.toFullObject();
      } catch {
        return {
          _id: user._id,
          email: user.email,
          name: user.name,
          avatar: user.avatar,
          role: user.role,
          anonymousId: user.anonymousId,
          walletBalance: user.walletBalance,
          kycStatus: user.kycStatus,
          isActive: user.isActive,
          isBanned: user.isBanned,
          createdAt: user.createdAt
        };
      }
    });
    
    res.json({
      success: true,
      data: usersData,
      pagination: { current: parseInt(page), pages: Math.ceil(total / limit), total }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error fetching users', code: 'FETCH_ERROR' }
    });
  }
};

/**
 * Get user by ID with full data
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }
    
    res.json({
      success: true,
      data: user.toFullObject()
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
 * Review and update KYC status
 */
export const reviewKYC = async (req, res) => {
  try {
    const { userId } = req.params;
    const { kycStatus, notes } = req.body;
    
    if (!['verified', 'rejected'].includes(kycStatus)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid KYC status',
          code: 'INVALID_STATUS'
        }
      });
    }
    
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
    
    user.kycStatus = kycStatus;
    await user.save();
    
    res.json({
      success: true,
      data: user.toFullObject(),
      message: `KYC ${kycStatus} successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error reviewing KYC',
        code: 'REVIEW_ERROR'
      }
    });
  }
};

/**
 * Update user role
 */
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid role. Must be either "user" or "admin"',
          code: 'INVALID_ROLE'
        }
      });
    }
    
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
    
    // Prevent self-demotion from admin
    if (req.user._id.toString() === userId && user.role === 'admin' && role === 'user') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Cannot demote yourself from admin role',
          code: 'SELF_DEMOTION_FORBIDDEN'
        }
      });
    }
    
    user.role = role;
    await user.save();
    
    res.json({
      success: true,
      data: user.toFullObject(),
      message: `User role updated to ${role} successfully`
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error updating user role',
        code: 'ROLE_UPDATE_ERROR'
      }
    });
  }
};

/**
 * Get all phones with full data including IMEI - OPTIMIZED
 */
export const getAllPhones = async (req, res) => {
  try {
    const { page = 1, limit = 100, status, verificationStatus, sellerId } = req.query;
    const skip = (page - 1) * limit;
    
    const filter = {};
    if (status) filter.status = status;
    if (verificationStatus) filter.verificationStatus = verificationStatus;
    if (sellerId) filter.sellerId = sellerId;
    
    // Parallel execution for speed
    const [phones, total] = await Promise.all([
      Phone.find(filter)
        .select('_id sellerId anonymousSellerId brand model storage ram color condition images description minBidPrice auctionEndTime status verificationStatus location createdAt')
        .sort({ createdAt: -1 })
        .limit(parseInt(limit))
        .skip(skip),
      Phone.countDocuments(filter)
    ]);
    
    // Fast mapping
    const phonesData = phones.map(phone => {
      try {
        return phone.toAdminObject();
      } catch {
        return {
          _id: phone._id,
          brand: phone.brand,
          model: phone.model,
          storage: phone.storage,
          condition: phone.condition,
          status: phone.status,
          verificationStatus: phone.verificationStatus,
          minBidPrice: phone.minBidPrice,
          location: phone.location,
          images: phone.images,
          createdAt: phone.createdAt
        };
      }
    });
    
    res.json({
      success: true,
      data: phonesData,
      pagination: { current: parseInt(page), pages: Math.ceil(total / limit), total }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error fetching phones', code: 'FETCH_ERROR' }
    });
  }
};

/**
 * Get phone by ID with full data
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
    
    res.json({
      success: true,
      data: phone.toAdminObject()
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
 * Get all transactions with decrypted IDs
 */
export const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, meetingStatus, escrowStatus } = req.query;
    
    const filter = {};
    if (meetingStatus) filter.meetingStatus = meetingStatus;
    if (escrowStatus) filter.escrowStatus = escrowStatus;
    
    // Don't use lean() so we can use model methods
    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .select('-__v')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit),
      Transaction.countDocuments(filter)
    ]);
    
    // Return full admin view with decrypted IDs
    const transactionsData = transactions.map(transaction => {
      try {
        return transaction.toAdminObject();
      } catch (err) {
        console.error('Error converting transaction:', err);
        return {
          _id: transaction._id,
          auctionId: transaction.auctionId,
          phoneId: transaction.phoneId,
          finalAmount: transaction.finalAmount,
          platformCommission: transaction.platformCommission,
          sellerPayout: transaction.sellerPayout,
          meetingStatus: transaction.meetingStatus,
          escrowStatus: transaction.escrowStatus,
          createdAt: transaction.createdAt
        };
      }
    });
    
    res.json({
      success: true,
      data: transactionsData,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching transactions',
        code: 'FETCH_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * Update transaction admin notes
 */
export const updateTransactionNotes = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;
    
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Transaction not found',
          code: 'TRANSACTION_NOT_FOUND'
        }
      });
    }
    
    transaction.adminNotes = adminNotes;
    await transaction.save();
    
    res.json({
      success: true,
      data: transaction.toAdminObject(),
      message: 'Admin notes updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error updating notes',
        code: 'UPDATE_ERROR'
      }
    });
  }
};

/**
 * Search by real or anonymous ID
 */
export const searchByIds = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Search query is required',
          code: 'MISSING_QUERY'
        }
      });
    }
    
    const results = {
      users: [],
      phones: [],
      auctions: [],
      bids: [],
      transactions: []
    };
    
    // Search users by real ID, anonymous ID, email, or name
    const userSearchConditions = [
      { anonymousId: query },
      { email: { $regex: query, $options: 'i' } },
      { name: { $regex: query, $options: 'i' } }
    ];
    
    // Check if query is a valid MongoDB ObjectId
    const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(query);
    if (isValidObjectId) {
      userSearchConditions.unshift({ _id: query });
    }
    
    const users = await User.find({
      $or: userSearchConditions
    });
    results.users = users.map(u => u.toFullObject());
    
    // Search phones by real seller ID or anonymous seller ID
    const phones = await Phone.find({
      $or: [
        { _id: query },
        { sellerId: query },
        { anonymousSellerId: query }
      ]
    });
    results.phones = phones.map(p => p.toAdminObject());
    
    // Search auctions
    const auctions = await Auction.find({ _id: query });
    results.auctions = auctions.map(a => a.toAdminObject());
    
    // Search bids
    const allBids = await Bid.find({});
    const matchingBids = allBids.filter(bid => {
      return bid._id.toString() === query || 
             bid.getBidderId() === query ||
             bid.anonymousBidderId === query;
    });
    results.bids = matchingBids.map(b => b.toAdminObject());
    
    // Search transactions
    const allTransactions = await Transaction.find({});
    const matchingTransactions = allTransactions.filter(transaction => {
      return transaction._id.toString() === query ||
             transaction.getSellerId() === query ||
             transaction.getBuyerId() === query;
    });
    results.transactions = matchingTransactions.map(t => t.toAdminObject());
    
    res.json({
      success: true,
      data: results,
      query
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error searching',
        code: 'SEARCH_ERROR'
      }
    });
  }
};

/**
 * Get all bids for a specific phone (Admin only)
 */
export const getPhoneBids = async (req, res) => {
  try {
    const { phoneId } = req.params;
    
    // Find auction for this phone
    const auction = await Auction.findOne({ phoneId });
    
    if (!auction) {
      return res.json({
        success: true,
        data: [],
        count: 0,
        message: 'No auction found for this phone'
      });
    }
    
    // Get all bids for this auction
    const bids = await Bid.find({ auctionId: auction._id })
      .sort({ bidAmount: -1 });
    
    // Return admin view with decrypted bidder IDs
    const bidsData = await Promise.all(bids.map(async (bid) => {
      const bidObj = bid.toAdminObject();
      
      // Get bidder details
      const bidderId = bid.getBidderId();
      if (bidderId) {
        const bidder = await User.findById(bidderId);
        if (bidder) {
          bidObj.bidderDetails = {
            name: bidder.name,
            email: bidder.email,
            phone: bidder.phone,
            anonymousId: bidder.anonymousId
          };
        }
      }
      
      return bidObj;
    }));
    
    res.json({
      success: true,
      data: bidsData,
      count: bidsData.length,
      auction: auction.toAdminObject()
    });
  } catch (error) {
    console.error('Error fetching phone bids:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching phone bids',
        code: 'FETCH_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * Get all bids with full details (Admin only)
 */
export const getAllBids = async (req, res) => {
  try {
    const { page = 1, limit = 50, auctionId, phoneId } = req.query;
    
    let filter = {};
    
    // Filter by auction if provided
    if (auctionId) {
      filter.auctionId = auctionId;
    }
    
    // Filter by phone if provided
    if (phoneId) {
      const auction = await Auction.findOne({ phoneId });
      if (auction) {
        filter.auctionId = auction._id;
      } else {
        return res.json({
          success: true,
          data: [],
          count: 0,
          message: 'No auction found for this phone'
        });
      }
    }
    
    const bids = await Bid.find(filter)
      .populate({
        path: 'auctionId',
        populate: {
          path: 'phoneId',
          model: 'Phone'
        }
      })
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Bid.countDocuments(filter);
    
    // Return admin view with decrypted bidder IDs and user details
    const bidsData = await Promise.all(bids.map(async (bid) => {
      const bidObj = bid.toAdminObject();
      
      // Get bidder details
      const bidderId = bid.getBidderId();
      if (bidderId) {
        const bidder = await User.findById(bidderId);
        if (bidder) {
          bidObj.bidderDetails = {
            _id: bidder._id,
            name: bidder.name,
            email: bidder.email,
            phone: bidder.phone,
            anonymousId: bidder.anonymousId
          };
        }
      }
      
      // Add phone details if available
      if (bid.auctionId && bid.auctionId.phoneId) {
        const phone = bid.auctionId.phoneId;
        bidObj.phoneDetails = {
          _id: phone._id,
          brand: phone.brand,
          model: phone.model,
          storage: phone.storage,
          condition: phone.condition,
          minBidPrice: phone.minBidPrice
        };
      }
      
      return bidObj;
    }));
    
    res.json({
      success: true,
      data: bidsData,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching bids:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching bids',
        code: 'FETCH_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * Get platform statistics - OPTIMIZED with aggregation pipelines
 */
export const getPlatformStatistics = async (req, res) => {
  try {
    // Check cache first
    const cacheKey = 'platform_statistics';
    const cachedStats = cache.get(cacheKey);
    if (cachedStats) {
      return res.json({ success: true, data: cachedStats, cached: true });
    }

    // Use aggregation pipelines for faster counting
    const [userAgg, phoneAgg, auctionAgg, bidAgg, transactionAgg, revenueData] = await Promise.all([
      // User stats in single aggregation
      User.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            buyers: [{ $match: { role: 'user' } }, { $count: 'count' }],
            admins: [{ $match: { role: 'admin' } }, { $count: 'count' }],
            kycPending: [{ $match: { kycStatus: 'pending' } }, { $count: 'count' }],
            kycVerified: [{ $match: { kycStatus: 'verified' } }, { $count: 'count' }],
            banned: [{ $match: { isBanned: true } }, { $count: 'count' }]
          }
        }
      ]).catch(() => [{}]),
      
      // Phone stats in single aggregation
      Phone.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            pending: [{ $match: { verificationStatus: 'pending' } }, { $count: 'count' }],
            approved: [{ $match: { verificationStatus: 'approved' } }, { $count: 'count' }],
            rejected: [{ $match: { verificationStatus: 'rejected' } }, { $count: 'count' }],
            live: [{ $match: { status: 'live' } }, { $count: 'count' }],
            sold: [{ $match: { status: 'sold' } }, { $count: 'count' }]
          }
        }
      ]).catch(() => [{}]),
      
      // Auction stats
      Auction.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            active: [{ $match: { status: 'active' } }, { $count: 'count' }],
            ended: [{ $match: { status: 'ended' } }, { $count: 'count' }],
            completed: [{ $match: { status: 'completed' } }, { $count: 'count' }]
          }
        }
      ]).catch(() => [{}]),
      
      // Bid stats
      Bid.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            winning: [{ $match: { isWinning: true } }, { $count: 'count' }]
          }
        }
      ]).catch(() => [{}]),
      
      // Transaction stats
      Transaction.aggregate([
        {
          $facet: {
            total: [{ $count: 'count' }],
            pending: [{ $match: { meetingStatus: 'pending' } }, { $count: 'count' }],
            completed: [{ $match: { meetingStatus: 'completed' } }, { $count: 'count' }],
            escrowHeld: [{ $match: { escrowStatus: 'held' } }, { $count: 'count' }],
            escrowReleased: [{ $match: { escrowStatus: 'released' } }, { $count: 'count' }]
          }
        }
      ]).catch(() => [{}]),
      
      // Revenue aggregation
      Transaction.aggregate([
        { $match: { escrowStatus: 'released' } },
        {
          $group: {
            _id: null,
            totalPlatformCommission: { $sum: '$platformCommission' },
            totalSellerPayouts: { $sum: '$sellerPayout' },
            totalTransactionValue: { $sum: '$finalAmount' }
          }
        }
      ]).catch(() => [])
    ]);

    // Helper to extract count from facet result
    const getCount = (agg, field) => agg?.[0]?.[field]?.[0]?.count || 0;
    
    const stats = {
      users: {
        total: getCount(userAgg, 'total'),
        buyers: getCount(userAgg, 'buyers'),
        sellers: getCount(userAgg, 'buyers'),
        admins: getCount(userAgg, 'admins'),
        kycPending: getCount(userAgg, 'kycPending'),
        kycVerified: getCount(userAgg, 'kycVerified'),
        banned: getCount(userAgg, 'banned')
      },
      phones: {
        total: getCount(phoneAgg, 'total'),
        pending: getCount(phoneAgg, 'pending'),
        approved: getCount(phoneAgg, 'approved'),
        rejected: getCount(phoneAgg, 'rejected'),
        live: getCount(phoneAgg, 'live'),
        sold: getCount(phoneAgg, 'sold')
      },
      auctions: {
        total: getCount(auctionAgg, 'total'),
        active: getCount(auctionAgg, 'active'),
        ended: getCount(auctionAgg, 'ended'),
        completed: getCount(auctionAgg, 'completed'),
        cancelled: Math.max(0, getCount(auctionAgg, 'total') - getCount(auctionAgg, 'active') - getCount(auctionAgg, 'ended') - getCount(auctionAgg, 'completed'))
      },
      bids: {
        total: getCount(bidAgg, 'total'),
        winning: getCount(bidAgg, 'winning')
      },
      transactions: {
        total: getCount(transactionAgg, 'total'),
        pending: getCount(transactionAgg, 'pending'),
        completed: getCount(transactionAgg, 'completed'),
        escrowHeld: getCount(transactionAgg, 'escrowHeld'),
        escrowReleased: getCount(transactionAgg, 'escrowReleased')
      },
      revenue: revenueData[0] || { totalPlatformCommission: 0, totalSellerPayouts: 0, totalTransactionValue: 0 }
    };
    
    // Cache for 30 seconds
    cache.set(cacheKey, stats, 30);
    
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error fetching statistics', code: 'STATS_ERROR' }
    });
  }
};

/**
 * Get all sold phones with buyer and seller details (Admin only) - OPTIMIZED
 */
export const getSoldPhones = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const skip = (page - 1) * limit;
    
    // Use aggregation with $lookup for efficient data fetching
    const [soldPhones, totalCount] = await Promise.all([
      Phone.aggregate([
        { $match: { status: 'sold' } },
        { $sort: { updatedAt: -1 } },
        { $skip: skip },
        { $limit: parseInt(limit) },
        // Lookup seller
        {
          $lookup: {
            from: 'users',
            localField: 'sellerId',
            foreignField: '_id',
            pipeline: [{ $project: { _id: 1, name: 1, email: 1, anonymousId: 1, avatar: 1 } }],
            as: 'sellerData'
          }
        },
        // Lookup auction
        {
          $lookup: {
            from: 'auctions',
            localField: '_id',
            foreignField: 'phoneId',
            pipeline: [{ $project: { _id: 1, currentBid: 1, totalBids: 1, winnerId: 1, anonymousLeadingBidder: 1 } }],
            as: 'auctionData'
          }
        },
        // Lookup transaction
        {
          $lookup: {
            from: 'transactions',
            localField: '_id',
            foreignField: 'phoneId',
            pipeline: [{ $project: { _id: 1, finalAmount: 1, platformCommission: 1, sellerPayout: 1, escrowStatus: 1, meetingStatus: 1, completedAt: 1, createdAt: 1, buyerId: 1 } }],
            as: 'transactionData'
          }
        },
        {
          $project: {
            _id: 1, sellerId: 1, anonymousSellerId: 1, brand: 1, model: 1, storage: 1, ram: 1, color: 1,
            condition: 1, images: 1, description: 1, minBidPrice: 1, status: 1, location: 1, createdAt: 1, updatedAt: 1,
            sellerDetails: { $arrayElemAt: ['$sellerData', 0] },
            auction: { $arrayElemAt: ['$auctionData', 0] },
            transaction: { $arrayElemAt: ['$transactionData', 0] }
          }
        }
      ]),
      Phone.countDocuments({ status: 'sold' })
    ]);
    
    // Format response
    const enrichedPhones = soldPhones.map(phone => ({
      _id: phone._id,
      sellerId: phone.sellerId,
      anonymousSellerId: phone.anonymousSellerId,
      brand: phone.brand,
      model: phone.model,
      storage: phone.storage,
      ram: phone.ram,
      color: phone.color,
      condition: phone.condition,
      images: phone.images,
      description: phone.description,
      minBidPrice: phone.minBidPrice,
      status: phone.status,
      location: phone.location,
      createdAt: phone.createdAt,
      sellerDetails: phone.sellerDetails || null,
      auctionId: phone.auction?._id,
      finalBidAmount: phone.auction?.currentBid,
      totalBids: phone.auction?.totalBids,
      transactionId: phone.transaction?._id,
      saleAmount: phone.transaction?.finalAmount,
      platformCommission: phone.transaction?.platformCommission,
      sellerPayout: phone.transaction?.sellerPayout,
      escrowStatus: phone.transaction?.escrowStatus,
      meetingStatus: phone.transaction?.meetingStatus,
      soldAt: phone.transaction?.completedAt || phone.transaction?.createdAt || phone.updatedAt
    }));
    
    res.json({
      success: true,
      data: enrichedPhones,
      pagination: { current: parseInt(page), pages: Math.ceil(totalCount / limit), total: totalCount }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Error fetching sold phones', code: 'FETCH_ERROR' }
    });
  }
};

export default {
  getAllUsers,
  getUserById,
  reviewKYC,
  getAllPhones,
  getPhoneById,
  getAllTransactions,
  updateTransactionNotes,
  searchByIds,
  getPlatformStatistics,
  getPhoneBids,
  getAllBids,
  getSoldPhones
};


/**
 * Delete user (Admin only)
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent deleting yourself
    if (id === req.userId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete your own account',
          code: 'CANNOT_DELETE_SELF'
        }
      });
    }
    
    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }
    
    // Delete user's phones and related auctions/bids
    const userPhones = await Phone.find({ sellerId: id });
    for (const phone of userPhones) {
      const auction = await Auction.findOne({ phoneId: phone._id });
      if (auction) {
        await Bid.deleteMany({ auctionId: auction._id });
        await Auction.findByIdAndDelete(auction._id);
      }
    }
    await Phone.deleteMany({ sellerId: id });
    
    // Delete user's bids
    await Bid.deleteMany({ bidderId: user.anonymousId });
    
    // Delete user's transactions
    await Transaction.deleteMany({ 
      $or: [
        { sellerId: user.anonymousId },
        { buyerId: user.anonymousId }
      ]
    });
    
    // Finally delete the user
    await User.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'User and all related data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error deleting user',
        code: 'DELETE_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * Delete phone (Admin only)
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
    
    // Delete related auction and bids
    const auction = await Auction.findOne({ phoneId: id });
    if (auction) {
      await Bid.deleteMany({ auctionId: auction._id });
      await Auction.findByIdAndDelete(auction._id);
    }
    
    // Delete related transactions
    await Transaction.deleteMany({ phoneId: id });
    
    // Finally delete the phone
    await Phone.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'Phone and all related data deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting phone:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error deleting phone',
        code: 'DELETE_ERROR',
        details: error.message
      }
    });
  }
};
