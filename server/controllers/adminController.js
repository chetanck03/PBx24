import Transaction from '../models/Transaction.js';
import User from '../models/User.js';
import Listing from '../models/Listing.js';
import Bid from '../models/Bid.js';

// Get all transactions
export const getAllTransactions = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;

    const transactions = await Transaction.find(filter)
      .populate('seller', 'name email avatar')
      .populate('buyer', 'name email avatar')
      .populate('listing', 'title brand model images')
      .populate('winningBid', 'amount')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Transaction.countDocuments(filter);

    res.json({
      success: true,
      data: {
        transactions,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get all transactions error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch transactions' }
    });
  }
};

// Approve transaction
export const approveTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: { message: 'Transaction not found' }
      });
    }

    transaction.status = 'approved';
    transaction.adminNotes = adminNotes || '';
    await transaction.save();

    res.json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    console.error('Approve transaction error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to approve transaction' }
    });
  }
};

// Flag transaction
export const flagTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { adminNotes } = req.body;

    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: { message: 'Transaction not found' }
      });
    }

    transaction.status = 'flagged';
    transaction.adminNotes = adminNotes || '';
    await transaction.save();

    res.json({
      success: true,
      data: { transaction }
    });
  } catch (error) {
    console.error('Flag transaction error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to flag transaction' }
    });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role } = req.query;
    
    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-googleId')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch users' }
    });
  }
};

// Get platform statistics
export const getPlatformStatistics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalListings = await Listing.countDocuments();
    const activeListings = await Listing.countDocuments({ status: 'active' });
    const totalBids = await Bid.countDocuments();
    const totalTransactions = await Transaction.countDocuments();
    const pendingTransactions = await Transaction.countDocuments({ status: 'pending' });
    
    // Revenue calculation (sum of all completed transactions)
    const revenueResult = await Transaction.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          admins: await User.countDocuments({ role: 'admin' }),
          regular: await User.countDocuments({ role: 'user' })
        },
        listings: {
          total: totalListings,
          active: activeListings,
          sold: await Listing.countDocuments({ status: 'sold' }),
          expired: await Listing.countDocuments({ status: 'expired' })
        },
        bids: {
          total: totalBids,
          winning: await Bid.countDocuments({ status: 'winning' }),
          selected: await Bid.countDocuments({ status: 'selected' })
        },
        transactions: {
          total: totalTransactions,
          pending: pendingTransactions,
          approved: await Transaction.countDocuments({ status: 'approved' }),
          completed: await Transaction.countDocuments({ status: 'completed' }),
          flagged: await Transaction.countDocuments({ status: 'flagged' })
        },
        revenue: {
          total: totalRevenue,
          thisMonth: 0 // TODO: Calculate this month's revenue
        }
      }
    });
  } catch (error) {
    console.error('Get platform statistics error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch statistics' }
    });
  }
};