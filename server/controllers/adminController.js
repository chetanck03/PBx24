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
  getPlatformStatistics
};
