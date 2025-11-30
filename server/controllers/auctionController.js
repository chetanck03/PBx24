import Auction from '../models/Auction.js';
import Phone from '../models/Phone.js';
import Bid from '../models/Bid.js';

/**
 * Create auction for a phone
 */
export const createAuction = async (req, res) => {
  try {
    const { phoneId, auctionEndTime } = req.body;
    
    if (!phoneId || !auctionEndTime) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Phone ID and auction end time are required',
          code: 'MISSING_FIELDS'
        }
      });
    }
    
    // Check if phone exists and is approved
    const phone = await Phone.findById(phoneId);
    if (!phone) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Phone not found',
          code: 'PHONE_NOT_FOUND'
        }
      });
    }
    
    if (phone.verificationStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Phone must be approved before creating auction',
          code: 'PHONE_NOT_APPROVED'
        }
      });
    }
    
    // Check if auction already exists
    const existingAuction = await Auction.findOne({ phoneId });
    if (existingAuction) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Auction already exists for this phone',
          code: 'AUCTION_EXISTS'
        }
      });
    }
    
    // Create auction
    const auction = new Auction({
      phoneId,
      auctionEndTime,
      status: 'active'
    });
    
    await auction.save();
    
    // Update phone status
    phone.status = 'live';
    await phone.save();
    
    res.status(201).json({
      success: true,
      data: auction.toPublicObject(),
      message: 'Auction created successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error creating auction',
        code: 'CREATE_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * Get all active auctions
 */
export const getActiveAuctions = async (req, res) => {
  try {
    const auctions = await Auction.find({ status: 'active' })
      .populate('phoneId')
      .sort({ auctionEndTime: 1 });
    
    const auctionsData = auctions.map(auction => 
      req.userRole === 'admin' ? auction.toAdminObject() : auction.toPublicObject()
    );
    
    res.json({
      success: true,
      data: auctionsData,
      count: auctionsData.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching auctions',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * Get auction by ID
 */
export const getAuctionById = async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await Auction.findById(id).populate('phoneId');
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Auction not found',
          code: 'AUCTION_NOT_FOUND'
        }
      });
    }
    
    const auctionData = req.userRole === 'admin' 
      ? auction.toAdminObject() 
      : auction.toPublicObject();
    
    res.json({
      success: true,
      data: auctionData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching auction',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * Get auction by phone ID
 */
export const getAuctionByPhoneId = async (req, res) => {
  try {
    const { phoneId } = req.params;
    const auction = await Auction.findOne({ phoneId }).populate('phoneId');
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Auction not found',
          code: 'AUCTION_NOT_FOUND'
        }
      });
    }
    
    const auctionData = req.userRole === 'admin' 
      ? auction.toAdminObject() 
      : auction.toPublicObject();
    
    res.json({
      success: true,
      data: auctionData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching auction',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * End auction
 */
export const endAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const auction = await Auction.findById(id);
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Auction not found',
          code: 'AUCTION_NOT_FOUND'
        }
      });
    }
    
    if (auction.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Auction is not active',
          code: 'AUCTION_NOT_ACTIVE'
        }
      });
    }
    
    // Set auction status to ended
    auction.status = 'ended';
    
    // Set winner if there's a leading bidder
    if (auction.leadingBidderId) {
      auction.setWinner(auction.getLeadingBidderId());
    }
    
    await auction.save();
    
    // Update phone status
    const phone = await Phone.findById(auction.phoneId);
    if (phone) {
      phone.status = 'ended';
      await phone.save();
    }
    
    res.json({
      success: true,
      data: req.userRole === 'admin' ? auction.toAdminObject() : auction.toPublicObject(),
      message: 'Auction ended successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error ending auction',
        code: 'END_ERROR'
      }
    });
  }
};

/**
 * Cancel auction
 */
export const cancelAuction = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    
    const auction = await Auction.findById(id);
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Auction not found',
          code: 'AUCTION_NOT_FOUND'
        }
      });
    }
    
    // Check if user is admin or phone owner
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
    
    if (phone.sellerId.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          code: 'NOT_AUTHORIZED'
        }
      });
    }
    
    auction.status = 'cancelled';
    await auction.save();
    
    phone.status = 'cancelled';
    await phone.save();
    
    res.json({
      success: true,
      message: 'Auction cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error cancelling auction',
        code: 'CANCEL_ERROR'
      }
    });
  }
};

export default {
  createAuction,
  getActiveAuctions,
  getAuctionById,
  getAuctionByPhoneId,
  endAuction,
  cancelAuction
};
