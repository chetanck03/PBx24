import Bid from '../models/Bid.js';
import Auction from '../models/Auction.js';
import Phone from '../models/Phone.js';
import User from '../models/User.js';
import { sendBidAcceptanceEmail, sendBidAcceptanceEmailToSeller } from '../services/emailService.js';
import { getCache, setCache, invalidateAuctionCache, cacheKeys, CACHE_TTL } from '../services/redisService.js';

/**
 * Place a bid on an auction - OPTIMIZED for speed
 */
export const placeBid = async (req, res) => {
  try {
    const { auctionId, bidAmount } = req.body;
    
    if (!auctionId || !bidAmount) {
      return res.status(400).json({
        success: false,
        error: { message: 'Auction ID and bid amount are required', code: 'MISSING_FIELDS' }
      });
    }
    
    // Validate bid amount is a valid number
    if (typeof bidAmount !== 'number' || isNaN(bidAmount) || !isFinite(bidAmount)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Invalid bid amount', code: 'INVALID_BID_AMOUNT' }
      });
    }
    
    // Maximum bid limit
    const MAX_BID_AMOUNT = 100000000;
    if (bidAmount > MAX_BID_AMOUNT) {
      return res.status(400).json({
        success: false,
        error: { message: `Maximum bid amount is ₹${MAX_BID_AMOUNT.toLocaleString()}`, code: 'BID_TOO_HIGH' }
      });
    }
    
    // Get auction and user in parallel for speed
    const [auction, bidder] = await Promise.all([
      Auction.findById(auctionId).populate('phoneId'),
      User.findById(req.userId).select('anonymousId')
    ]);
    
    if (!auction) {
      return res.status(404).json({
        success: false,
        error: { message: 'Auction not found', code: 'AUCTION_NOT_FOUND' }
      });
    }
    
    if (!bidder) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found', code: 'USER_NOT_FOUND' }
      });
    }
    
    // Quick validations
    if (auction.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: { message: 'Auction is not active', code: 'AUCTION_NOT_ACTIVE' }
      });
    }
    
    if (new Date() > auction.auctionEndTime) {
      return res.status(400).json({
        success: false,
        error: { message: 'Auction has ended', code: 'AUCTION_ENDED' }
      });
    }
    
    const phone = auction.phoneId;
    if (phone.sellerId.toString() === req.userId) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot bid on your own listing', code: 'CANNOT_BID_OWN' }
      });
    }
    
    // Bidding starts from ₹1 - buyers decide the price
    const minBidAmount = auction.currentBid || 0;
    if (bidAmount <= minBidAmount) {
      return res.status(400).json({
        success: false,
        error: { message: `Bid must be higher than ₹${minBidAmount.toLocaleString()}`, code: 'BID_TOO_LOW' }
      });
    }
    
    // Prevent unreasonably high bids
    const currentBidValue = auction.currentBid || 1;
    if (bidAmount > currentBidValue * 100 && currentBidValue > 0) {
      return res.status(400).json({
        success: false,
        error: { message: `Bid cannot be more than 100x the current bid`, code: 'BID_UNREASONABLE' }
      });
    }
    
    // Get or generate anonymousId
    let anonymousId = bidder.anonymousId;
    if (!anonymousId) {
      await bidder.save(); // This will trigger pre-save hook to generate anonymousId
      anonymousId = bidder.anonymousId;
    }
    
    // Create new bid
    const bid = new Bid({
      auctionId,
      bidAmount,
      isWinning: true,
      anonymousBidderId: anonymousId
    });
    bid.setBidder(req.userId);
    
    // Update auction
    auction.updateBid(bidAmount, req.userId, anonymousId);
    
    // Save bid, auction, and update previous bids in parallel
    await Promise.all([
      bid.save(),
      auction.save(),
      Bid.updateMany({ auctionId, isWinning: true, _id: { $ne: bid._id } }, { isWinning: false })
    ]);
    
    // Invalidate Redis cache for this auction (non-blocking)
    invalidateAuctionCache(auctionId, phone._id.toString()).catch(() => {});
    
    // Emit WebSocket event (non-blocking)
    const io = req.app.get('io');
    if (io) {
      const bidData = {
        bid: bid.toPublicObject(),
        auction: {
          _id: auction._id,
          currentBid: auction.currentBid,
          totalBids: auction.totalBids,
          anonymousLeadingBidder: auction.anonymousLeadingBidder
        },
        phoneId: phone._id.toString()
      };
      io.to(`phone_${phone._id}`).emit('new_bid', bidData);
    }
    
    res.status(201).json({
      success: true,
      data: bid.toSelfObject(),
      message: 'Bid placed successfully'
    });
  } catch (error) {
    console.error('Bid error:', error.message);
    res.status(500).json({
      success: false,
      error: { message: 'Error placing bid', code: 'BID_ERROR', details: error.message }
    });
  }
};

/**
 * Get bids for an auction
 */
export const getAuctionBids = async (req, res) => {
  try {
    const { auctionId } = req.params;
    const bids = await Bid.find({ auctionId }).sort({ bidAmount: -1 });
    
    // Return appropriate view based on role (handle non-authenticated users)
    const bidsData = bids.map(bid => {
      if (req.userRole === 'admin') {
        return bid.toAdminObject();
      } else if (req.userId && bid.getBidderId() === req.userId) {
        return bid.toSelfObject();
      } else {
        return bid.toPublicObject();
      }
    });
    
    res.json({
      success: true,
      data: bidsData,
      count: bidsData.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching bids',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * Get user's bids - shows only latest bid per phone
 */
export const getUserBids = async (req, res) => {
  try {
    // Find all bids and populate auction with phone details
    const allBids = await Bid.find({})
      .populate({
        path: 'auctionId',
        populate: {
          path: 'phoneId',
          model: 'Phone'
        }
      })
      .sort({ timestamp: -1 });
    
    // Filter bids that belong to this user (decrypt and compare)
    const userBids = allBids.filter(bid => {
      try {
        const decryptedBidderId = bid.getBidderId();
        return decryptedBidderId === req.userId;
      } catch (error) {
        console.error('Error decrypting bid:', error);
        return false;
      }
    });
    
    // Group bids by phone ID and keep only the latest bid per phone
    const phoneMap = new Map();
    
    userBids.forEach(bid => {
      if (bid.auctionId && bid.auctionId.phoneId) {
        const phoneId = bid.auctionId.phoneId._id.toString();
        
        // If this phone is not in map, or this bid is newer, update it
        if (!phoneMap.has(phoneId)) {
          phoneMap.set(phoneId, bid);
        }
        // Since bids are already sorted by timestamp DESC, first occurrence is latest
      }
    });
    
    // Convert map values to array and map with phone details
    const uniqueBids = Array.from(phoneMap.values());
    
    const bidsData = uniqueBids.map(bid => {
      const bidObj = bid.toSelfObject();
      
      // Add phone details if available
      if (bid.auctionId && bid.auctionId.phoneId) {
        const phone = bid.auctionId.phoneId;
        bidObj.phone = {
          _id: phone._id,
          brand: phone.brand,
          model: phone.model,
          storage: phone.storage,
          condition: phone.condition,
          images: phone.images,
          minBidPrice: phone.minBidPrice,
          status: phone.status
        };
        bidObj.auction = {
          _id: bid.auctionId._id,
          status: bid.auctionId.status,
          auctionEndTime: bid.auctionId.auctionEndTime,
          currentBid: bid.auctionId.currentBid
        };
      }
      
      return bidObj;
    });
    
    res.json({
      success: true,
      data: bidsData,
      count: bidsData.length
    });
  } catch (error) {
    console.error('Error fetching user bids:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching user bids',
        code: 'FETCH_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * Accept a bid (Seller can end auction early by accepting a bid)
 */
export const acceptBid = async (req, res) => {
  try {
    const { bidId } = req.params;
    
    const bid = await Bid.findById(bidId).populate('auctionId');
    if (!bid) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Bid not found',
          code: 'BID_NOT_FOUND'
        }
      });
    }
    
    const auction = bid.auctionId;
    if (!auction) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Auction not found',
          code: 'AUCTION_NOT_FOUND'
        }
      });
    }
    
    // Get phone and verify seller
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
    
    // Check if user is the seller - ONLY the seller can accept bids (not even admin)
    if (phone.sellerId.toString() !== req.userId) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Only the seller can accept bids',
          code: 'NOT_SELLER'
        }
      });
    }
    
    // Check if auction is still active
    if (auction.status !== 'active') {
      console.log('Auction status check failed:', {
        auctionId: auction._id,
        status: auction.status,
        phoneId: auction.phoneId,
        phoneStatus: phone.status
      });
      return res.status(400).json({
        success: false,
        error: {
          message: `Auction is not active (current status: ${auction.status})`,
          code: 'AUCTION_NOT_ACTIVE'
        }
      });
    }
    
    // Also check if phone is still live
    if (phone.status !== 'live') {
      return res.status(400).json({
        success: false,
        error: {
          message: `Phone is not available for auction (status: ${phone.status})`,
          code: 'PHONE_NOT_AVAILABLE'
        }
      });
    }
    
    // Get winner details
    const winnerId = bid.getBidderId();
    const winner = await User.findById(winnerId);
    
    // End auction and set winner
    auction.status = 'ended';
    auction.setWinner(winnerId);
    await auction.save();
    
    // Update phone status
    phone.status = 'sold';
    await phone.save();
    
    // Mark all other bids as not winning
    await Bid.updateMany(
      { auctionId: auction._id, _id: { $ne: bidId } },
      { isWinning: false }
    );
    
    // Get seller details
    const seller = await User.findById(phone.sellerId);
    
    const phoneDetails = {
      brand: phone.brand,
      model: phone.model,
      storage: phone.storage,
      condition: phone.condition
    };
    
    // Send email notification to winner (buyer)
    if (winner && winner.email) {
      try {
        await sendBidAcceptanceEmail(
          winner.email,
          winner.name,
          phoneDetails,
          bid.bidAmount
        );
        console.log(`Bid acceptance email sent to buyer: ${winner.email}`);
      } catch (emailError) {
        console.error('Failed to send bid acceptance email to buyer:', emailError);
        // Don't fail the request if email fails
      }
    }
    
    // Send email notification to seller
    if (seller && seller.email) {
      try {
        await sendBidAcceptanceEmailToSeller(
          seller.email,
          seller.name,
          phoneDetails,
          bid.bidAmount,
          winner?.anonymousId || bid.anonymousBidderId
        );
        console.log(`Sale confirmation email sent to seller: ${seller.email}`);
      } catch (emailError) {
        console.error('Failed to send sale confirmation email to seller:', emailError);
        // Don't fail the request if email fails
      }
    }
    
    res.json({
      success: true,
      message: 'Bid accepted successfully. Auction ended. Both buyer and seller have been notified via email.',
      data: {
        auction: auction.toPublicObject(),
        winningBid: bid.toPublicObject()
      }
    });
  } catch (error) {
    console.error('Error accepting bid:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error accepting bid',
        code: 'ACCEPT_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * Get bids for seller's auction
 */
export const getSellerAuctionBids = async (req, res) => {
  try {
    const { auctionId } = req.params;
    
    // Get auction and verify seller
    const auction = await Auction.findById(auctionId).populate('phoneId');
    if (!auction) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Auction not found',
          code: 'AUCTION_NOT_FOUND'
        }
      });
    }
    
    const phone = auction.phoneId;
    if (phone.sellerId.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          code: 'NOT_AUTHORIZED'
        }
      });
    }
    
    // Get all bids for this auction
    const bids = await Bid.find({ auctionId }).sort({ bidAmount: -1 });
    
    // Return bids with anonymous IDs (seller can see all bids but not real identities)
    const bidsData = bids.map(bid => ({
      _id: bid._id,
      anonymousBidderId: bid.anonymousBidderId,
      bidAmount: bid.bidAmount,
      timestamp: bid.timestamp,
      isWinning: bid.isWinning
    }));
    
    res.json({
      success: true,
      data: bidsData,
      count: bidsData.length
    });
  } catch (error) {
    console.error('Error fetching seller auction bids:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching bids',
        code: 'FETCH_ERROR'
      }
    });
  }
};

export default {
  placeBid,
  getAuctionBids,
  getUserBids,
  acceptBid,
  getSellerAuctionBids
};
