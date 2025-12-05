import User from '../models/User.js';
import Phone from '../models/Phone.js';
import Auction from '../models/Auction.js';
import Bid from '../models/Bid.js';
import Transaction from '../models/Transaction.js';

/**
 * Get all users with full decrypted data
 */
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, kycStatus } = req.query;
    
    const filter = {};
    if (role) filter.role = role;
    if (kycStatus) filter.kycStatus = kycStatus;
    
    const users = await User.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(filter);
    
    // Return full decrypted data for admin
    const usersData = users.map(user => user.toFullObject());
    
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
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching users',
        code: 'FETCH_ERROR'
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
    
    const phones = await Phone.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Phone.countDocuments(filter);
    
    // Return full admin view with decrypted IMEI
    const phonesData = phones.map(phone => phone.toAdminObject());
    
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
    
    const transactions = await Transaction.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Transaction.countDocuments(filter);
    
    // Return full admin view with decrypted IDs
    const transactionsData = transactions.map(transaction => transaction.toAdminObject());
    
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
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching transactions',
        code: 'FETCH_ERROR'
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
    
    // Search users by real ID or anonymous ID
    const users = await User.find({
      $or: [
        { _id: query },
        { anonymousId: query }
      ]
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
    const stats = {
      users: {
        total: await User.countDocuments(),
        buyers: await User.countDocuments({ role: 'user' }),
        sellers: await User.countDocuments({ role: 'user' }),
        admins: await User.countDocuments({ role: 'admin' }),
        kycPending: await User.countDocuments({ kycStatus: 'pending' }),
        kycVerified: await User.countDocuments({ kycStatus: 'verified' }),
        banned: await User.countDocuments({ isBanned: true })
      },
      phones: {
        total: await Phone.countDocuments(),
        pending: await Phone.countDocuments({ verificationStatus: 'pending' }),
        approved: await Phone.countDocuments({ verificationStatus: 'approved' }),
        rejected: await Phone.countDocuments({ verificationStatus: 'rejected' }),
        live: await Phone.countDocuments({ status: 'live' }),
        sold: await Phone.countDocuments({ status: 'sold' })
      },
      auctions: {
        total: await Auction.countDocuments(),
        active: await Auction.countDocuments({ status: 'active' }),
        ended: await Auction.countDocuments({ status: 'ended' }),
        completed: await Auction.countDocuments({ status: 'completed' })
      },
      bids: {
        total: await Bid.countDocuments(),
        winning: await Bid.countDocuments({ isWinning: true })
      },
      transactions: {
        total: await Transaction.countDocuments(),
        pending: await Transaction.countDocuments({ meetingStatus: 'pending' }),
        completed: await Transaction.countDocuments({ meetingStatus: 'completed' }),
        escrowHeld: await Transaction.countDocuments({ escrowStatus: 'held' }),
        escrowReleased: await Transaction.countDocuments({ escrowStatus: 'released' })
      }
    };
    
    // Calculate revenue
    const transactions = await Transaction.find({ escrowStatus: 'released' });
    stats.revenue = {
      totalPlatformCommission: transactions.reduce((sum, t) => sum + t.platformCommission, 0),
      totalSellerPayouts: transactions.reduce((sum, t) => sum + t.sellerPayout, 0),
      totalTransactionValue: transactions.reduce((sum, t) => sum + t.finalAmount, 0)
    };
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching statistics',
        code: 'STATS_ERROR'
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
  getAllBids
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
