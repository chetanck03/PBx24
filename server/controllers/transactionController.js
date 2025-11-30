import Transaction from '../models/Transaction.js';
import Auction from '../models/Auction.js';
import Phone from '../models/Phone.js';

/**
 * Create transaction after auction ends
 */
export const createTransaction = async (req, res) => {
  try {
    const { auctionId, platformCommissionPercent = 5 } = req.body;
    
    if (!auctionId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Auction ID is required',
          code: 'MISSING_AUCTION_ID'
        }
      });
    }
    
    // Get auction
    const auction = await Auction.findById(auctionId);
    if (!auction) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Auction not found',
          code: 'AUCTION_NOT_FOUND'
        }
      });
    }
    
    // Check if auction has ended
    if (auction.status !== 'ended') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Auction must be ended to create transaction',
          code: 'AUCTION_NOT_ENDED'
        }
      });
    }
    
    // Check if winner exists
    const winnerId = auction.getWinnerId();
    if (!winnerId) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'No winner for this auction',
          code: 'NO_WINNER'
        }
      });
    }
    
    // Get phone
    const phone = await Phone.findById(auction.phoneId);
    if (!phone) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Phone not found',
          code: 'PHONE_NOT_FOUND'
        }
      });
    }
    
    // Check if transaction already exists
    const existingTransaction = await Transaction.findOne({ auctionId });
    if (existingTransaction) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Transaction already exists for this auction',
          code: 'TRANSACTION_EXISTS'
        }
      });
    }
    
    // Calculate amounts
    const finalAmount = auction.currentBid;
    const platformCommission = (finalAmount * platformCommissionPercent) / 100;
    const sellerPayout = finalAmount - platformCommission;
    
    // Create transaction
    const transaction = new Transaction({
      auctionId,
      phoneId: phone._id,
      finalAmount,
      platformCommission,
      sellerPayout,
      escrowStatus: 'held'
    });
    
    // Encrypt seller and buyer IDs
    transaction.setSeller(phone.sellerId);
    transaction.setBuyer(winnerId);
    
    await transaction.save();
    
    // Update auction status
    auction.status = 'completed';
    await auction.save();
    
    // Update phone status
    phone.status = 'sold';
    await phone.save();
    
    res.status(201).json({
      success: true,
      data: req.userRole === 'admin' ? transaction.toAdminObject() : transaction.toSellerObject(),
      message: 'Transaction created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error creating transaction',
        code: 'CREATE_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * Get user's transactions
 */
export const getUserTransactions = async (req, res) => {
  try {
    // Get all transactions and filter by user
    const allTransactions = await Transaction.find({});
    
    const userTransactions = allTransactions.filter(transaction => {
      const sellerId = transaction.getSellerId();
      const buyerId = transaction.getBuyerId();
      return sellerId === req.userId || buyerId === req.userId;
    });
    
    // Return appropriate view
    const transactionsData = userTransactions.map(transaction => {
      const sellerId = transaction.getSellerId();
      const buyerId = transaction.getBuyerId();
      
      if (req.userRole === 'admin') {
        return transaction.toAdminObject();
      } else if (sellerId === req.userId) {
        return transaction.toSellerObject();
      } else if (buyerId === req.userId) {
        return transaction.toBuyerObject();
      }
      return null;
    }).filter(t => t !== null);
    
    res.json({
      success: true,
      data: transactionsData,
      count: transactionsData.length
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
 * Get transaction by ID
 */
export const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
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
    
    // Check access
    const sellerId = transaction.getSellerId();
    const buyerId = transaction.getBuyerId();
    
    if (req.userRole !== 'admin' && sellerId !== req.userId && buyerId !== req.userId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          code: 'ACCESS_DENIED'
        }
      });
    }
    
    // Return appropriate view
    let transactionData;
    if (req.userRole === 'admin') {
      transactionData = transaction.toAdminObject();
    } else if (sellerId === req.userId) {
      transactionData = transaction.toSellerObject();
    } else {
      transactionData = transaction.toBuyerObject();
    }
    
    res.json({
      success: true,
      data: transactionData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching transaction',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * Confirm seller appointment
 */
export const confirmSellerAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;
    
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
    
    // Check if user is seller
    if (transaction.getSellerId() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Only seller can confirm seller appointment',
          code: 'NOT_SELLER'
        }
      });
    }
    
    transaction.sellerAppointment = {
      date: date || new Date(),
      time: time || 'TBD',
      status: 'confirmed'
    };
    
    await transaction.save();
    
    res.json({
      success: true,
      data: transaction.toSellerObject(),
      message: 'Seller appointment confirmed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error confirming appointment',
        code: 'CONFIRM_ERROR'
      }
    });
  }
};

/**
 * Confirm buyer appointment
 */
export const confirmBuyerAppointment = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, time } = req.body;
    
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
    
    // Check if user is buyer
    if (transaction.getBuyerId() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Only buyer can confirm buyer appointment',
          code: 'NOT_BUYER'
        }
      });
    }
    
    transaction.buyerAppointment = {
      date: date || new Date(),
      time: time || 'TBD',
      status: 'confirmed'
    };
    
    await transaction.save();
    
    res.json({
      success: true,
      data: transaction.toBuyerObject(),
      message: 'Buyer appointment confirmed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error confirming appointment',
        code: 'CONFIRM_ERROR'
      }
    });
  }
};

/**
 * Complete seller appointment
 */
export const completeSellerAppointment = async (req, res) => {
  try {
    const { id } = req.params;
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
    
    // Check if user is seller
    if (transaction.getSellerId() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Only seller can complete seller appointment',
          code: 'NOT_SELLER'
        }
      });
    }
    
    transaction.sellerAppointment.status = 'completed';
    transaction.meetingStatus = 'seller_completed';
    
    await transaction.save();
    
    res.json({
      success: true,
      data: transaction.toSellerObject(),
      message: 'Seller appointment completed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error completing appointment',
        code: 'COMPLETE_ERROR'
      }
    });
  }
};

/**
 * Complete buyer appointment
 */
export const completeBuyerAppointment = async (req, res) => {
  try {
    const { id } = req.params;
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
    
    // Check if user is buyer
    if (transaction.getBuyerId() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Only buyer can complete buyer appointment',
          code: 'NOT_BUYER'
        }
      });
    }
    
    transaction.buyerAppointment.status = 'completed';
    
    // Check if both appointments are completed
    if (transaction.sellerAppointment?.status === 'completed') {
      transaction.meetingStatus = 'completed';
      transaction.escrowStatus = 'released';
      transaction.completedAt = new Date();
    } else {
      transaction.meetingStatus = 'buyer_completed';
    }
    
    await transaction.save();
    
    res.json({
      success: true,
      data: transaction.toBuyerObject(),
      message: 'Buyer appointment completed'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error completing appointment',
        code: 'COMPLETE_ERROR'
      }
    });
  }
};

export default {
  createTransaction,
  getUserTransactions,
  getTransactionById,
  confirmSellerAppointment,
  confirmBuyerAppointment,
  completeSellerAppointment,
  completeBuyerAppointment
};
