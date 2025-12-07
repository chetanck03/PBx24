import User from '../models/User.js';
import Phone from '../models/Phone.js';
import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import Transaction from '../models/Transaction.js';
import cache from '../utils/cache.js';

/**
 * Get all users with full decrypted data
 */
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, kycStatus } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (kycStatus) filter.kycStatus = kycStatus;
    
    // Don't use lean() so we can use model methods
    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-__v')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit),
      User.countDocuments(filter)
    ]);
    
    // Return full decrypted data for admin
    const usersData = users.map(user => {
      try {
        return user.toFullObject();
      } catch (err) {
        console.error('Error converting user:', err);
        // Return basic user data if conversion fails
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
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
      }
    });
    
    res.json({
      success: true,
      data: usersData,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching users',
        code: 'FETCH_ERROR',
        details: error.message
      }
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
 * Get all phones with full data including IMEI
 */
export const getAllPhones = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, verificationStatus, sellerId } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (verificationStatus) filter.verificationStatus = verificationStatus;
    if (sellerId) filter.sellerId = sellerId;
    
    // Don't use lean() so we can use model methods
    const [phones, total] = await Promise.all([
      Phone.find(filter)
        .select('-__v')
        .sort({ createdAt: -1 })
        .limit(limit * 1)
        .skip((page - 1) * limit),
      Phone.countDocuments(filter)
    ]);
    
    // Return full admin view with decrypted IMEI
    const phonesData = phones.map(phone => {
      try {
        return phone.toAdminObject();
      } catch (err) {
        console.error('Error converting phone:', err);
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
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching phones:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching phones',
        code: 'FETCH_ERROR',
        details: error.message
      }
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
 * Get platform statistics
 */
export const getPlatformStatistics = async (req, res) => {
  try {
    // Check cache first
    const cacheKey = 'platform_statistics';
    const cachedStats = cache.get(cacheKey);
    if (cachedStats) {
      return res.json({
        success: true,
        data: cachedStats,
        cached: true
      });
    }

    // Fetch all stats with individual error handling
    const [userStats, phoneStats, auctionStats, bidStats, transactionStats, revenueData] = await Promise.all([
      Promise.all([
        User.countDocuments().catch(() => 0),
        User.countDocuments({ role: 'user' }).catch(() => 0),
        User.countDocuments({ role: 'admin' }).catch(() => 0),
        User.countDocuments({ kycStatus: 'pending' }).catch(() => 0),
        User.countDocuments({ kycStatus: 'verified' }).catch(() => 0),
        User.countDocuments({ isBanned: true }).catch(() => 0)
      ]),
      Promise.all([
        Phone.countDocuments().catch(() => 0),
        Phone.countDocuments({ verificationStatus: 'pending' }).catch(() => 0),
        Phone.countDocuments({ verificationStatus: 'approved' }).catch(() => 0),
        Phone.countDocuments({ verificationStatus: 'rejected' }).catch(() => 0),
        Phone.countDocuments({ status: 'live' }).catch(() => 0),
        Phone.countDocuments({ status: 'sold' }).catch(() => 0)
      ]),
      Promise.all([
        Auction.countDocuments().catch(() => 0),
        Auction.countDocuments({ status: 'active' }).catch(() => 0),
        Auction.countDocuments({ status: 'ended' }).catch(() => 0),
        Auction.countDocuments({ status: 'completed' }).catch(() => 0)
      ]),
      Promise.all([
        Bid.countDocuments().catch(() => 0),
        Bid.countDocuments({ isWinning: true }).catch(() => 0)
      ]),
      Promise.all([
        Transaction.countDocuments().catch(() => 0),
        Transaction.countDocuments({ meetingStatus: 'pending' }).catch(() => 0),
        Transaction.countDocuments({ meetingStatus: 'completed' }).catch(() => 0),
        Transaction.countDocuments({ escrowStatus: 'held' }).catch(() => 0),
        Transaction.countDocuments({ escrowStatus: 'released' }).catch(() => 0)
      ]),
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
    
    const stats = {
      users: {
        total: userStats[0] || 0,
        buyers: userStats[1] || 0,
        sellers: userStats[1] || 0,
        admins: userStats[2] || 0,
        kycPending: userStats[3] || 0,
        kycVerified: userStats[4] || 0,
        banned: userStats[5] || 0
      },
      phones: {
        total: phoneStats[0] || 0,
        pending: phoneStats[1] || 0,
        approved: phoneStats[2] || 0,
        rejected: phoneStats[3] || 0,
        live: phoneStats[4] || 0,
        sold: phoneStats[5] || 0
      },
      auctions: {
        total: auctionStats[0] || 0,
        active: auctionStats[1] || 0,
        ended: auctionStats[2] || 0,
        completed: auctionStats[3] || 0,
        cancelled: Math.max(0, (auctionStats[0] || 0) - (auctionStats[1] || 0) - (auctionStats[2] || 0) - (auctionStats[3] || 0))
      },
      bids: {
        total: bidStats[0] || 0,
        winning: bidStats[1] || 0
      },
      transactions: {
        total: transactionStats[0] || 0,
        pending: transactionStats[1] || 0,
        completed: transactionStats[2] || 0,
        escrowHeld: transactionStats[3] || 0,
        escrowReleased: transactionStats[4] || 0
      },
      revenue: revenueData[0] || {
        totalPlatformCommission: 0,
        totalSellerPayouts: 0,
        totalTransactionValue: 0
      }
    };
    
    // Cache for 30 seconds
    cache.set(cacheKey, stats, 30);
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching statistics',
        code: 'STATS_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * Get all sold phones with buyer and seller details (Admin only)
 */
export const getSoldPhones = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    // Get all phones with status 'sold'
    const soldPhones = await Phone.find({ status: 'sold' })
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Phone.countDocuments({ status: 'sold' });
    
    // Enrich with buyer, seller, and transaction details
    const enrichedPhones = await Promise.all(soldPhones.map(async (phone) => {
      const phoneData = phone.toAdminObject();
      
      // Get seller details
      const seller = await User.findById(phone.sellerId);
      if (seller) {
        phoneData.sellerDetails = {
          _id: seller._id,
          name: seller.name,
          email: seller.email,
          anonymousId: seller.anonymousId,
          avatar: seller.avatar
        };
      }
      
      // Get auction to find winner
      const auction = await Auction.findOne({ phoneId: phone._id });
      if (auction) {
        phoneData.auctionId = auction._id;
        phoneData.finalBidAmount = auction.currentBid;
        phoneData.totalBids = auction.totalBids;
        
        // Get winner/buyer details
        const winnerId = auction.getWinnerId();
        if (winnerId) {
          const buyer = await User.findById(winnerId);
          if (buyer) {
            phoneData.buyerDetails = {
              _id: buyer._id,
              name: buyer.name,
              email: buyer.email,
              anonymousId: buyer.anonymousId,
              avatar: buyer.avatar
            };
          }
        }
      }
      
      // Get transaction details if exists
      const transaction = await Transaction.findOne({ phoneId: phone._id });
      if (transaction) {
        phoneData.transactionId = transaction._id;
        phoneData.saleAmount = transaction.finalAmount;
        phoneData.platformCommission = transaction.platformCommission;
        phoneData.sellerPayout = transaction.sellerPayout;
        phoneData.escrowStatus = transaction.escrowStatus;
        phoneData.meetingStatus = transaction.meetingStatus;
        phoneData.soldAt = transaction.completedAt || transaction.createdAt;
        
        // If no buyer from auction, try from transaction
        if (!phoneData.buyerDetails) {
          const buyerId = transaction.getBuyerId();
          if (buyerId) {
            const buyer = await User.findById(buyerId);
            if (buyer) {
              phoneData.buyerDetails = {
                _id: buyer._id,
                name: buyer.name,
                email: buyer.email,
                anonymousId: buyer.anonymousId,
                avatar: buyer.avatar
              };
            }
          }
        }
      }
      
      return phoneData;
    }));
    
    res.json({
      success: true,
      data: enrichedPhones,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Error fetching sold phones:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching sold phones',
        code: 'FETCH_ERROR',
        details: error.message
      }
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
