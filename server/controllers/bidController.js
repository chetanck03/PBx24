import Bid from '../models/Bid.js';
import Auction from '../models/Auction.js';
import Phone from '../models/Phone.js';
import User from '../models/User.js';
import { sendBidAcceptanceEmail } from '../services/emailService.js';

/**
 * Place a bid on an auction
 */
export const placeBid = async (req, res) => {
  try {
    console.log('=== PLACE BID REQUEST ===');
    console.log('User ID:', req.userId);
    console.log('Body:', req.body);
    
    const { auctionId, bidAmount } = req.body;
    
    if (!auctionId || !bidAmount) {
      console.log('Missing fields');
      return res.status(400).json({
        success: false,
        error: {
          message: 'Auction ID and bid amount are required',
          code: 'MISSING_FIELDS'
        }
      });
    }
    
    // Get auction
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
    
    // Check if auction is active
    if (auction.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Auction is not active',
          code: 'AUCTION_NOT_ACTIVE'
        }
      });
    }
    
    // Check if auction has ended
    if (new Date() > auction.auctionEndTime) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Auction has ended',
          code: 'AUCTION_ENDED'
        }
      });
    }
    
    // Check if user is not the seller
    const phone = auction.phoneId;
    console.log('Phone seller ID:', phone.sellerId.toString());
    console.log('Current user ID:', req.userId);
    console.log('Is same user?', phone.sellerId.toString() === req.userId);
    
    if (phone.sellerId.toString() === req.userId) {
      console.log('User trying to bid on own listing');
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot bid on your own listing',
          code: 'CANNOT_BID_OWN'
        }
      });
    }
    
    // Check if bid is higher than current bid
    const minBidAmount = Math.max(auction.currentBid, phone.minBidPrice);
    console.log('Min bid amount:', minBidAmount);
    console.log('User bid amount:', bidAmount);
    console.log('Is bid high enough?', bidAmount > minBidAmount);
    
    if (bidAmount <= minBidAmount) {
      console.log('Bid too low');
      return res.status(400).json({
        success: false,
        error: {
          message: `Bid must be higher than ₹${minBidAmount}`,
          code: 'BID_TOO_LOW'
        }
      });
    }
    
    // Get bidder info
    let bidder = await User.findById(req.userId);
    if (!bidder) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        }
      });
    }
    
    // Ensure user has an anonymousId (for users created before this field was added)
    if (!bidder.anonymousId) {
      console.log('User missing anonymousId, generating one...');
      // The pre-save hook will generate it
      await bidder.save();
      // Reload the user to get the generated anonymousId
      bidder = await User.findById(req.userId);
      console.log('Generated anonymousId:', bidder.anonymousId);
    }
    
    console.log('Using anonymousBidderId:', bidder.anonymousId);
    
    // Update previous winning bids
    await Bid.updateMany(
      { auctionId, isWinning: true },
      { isWinning: false }
    );
    
    // Create new bid
    const bid = new Bid({
      auctionId,
      bidAmount,
      isWinning: true,
      anonymousBidderId: bidder.anonymousId // Use user's existing anonymous ID
    });
    
    // Encrypt bidder ID
    bid.setBidder(req.userId);
    
    console.log('Saving bid...');
    await bid.save();
    console.log('Bid saved successfully');
    
    // Update auction
    auction.updateBid(bidAmount, req.userId, bid.anonymousBidderId);
    await auction.save();
    
    console.log('Bid placed successfully!');
    console.log('=== END PLACE BID ===');
    
    res.status(201).json({
      success: true,
      data: bid.toSelfObject(),
      message: 'Bid placed successfully'
    });
  } catch (error) {
    console.error('=== BID ERROR ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    
    // Write to log file for debugging
    const fs = require('fs');
    const logMessage = `
=== BID ERROR ${new Date().toISOString()} ===
User ID: ${req.userId}
Error: ${error.message}
Stack: ${error.stack}
=====================================
`;
    fs.appendFileSync('bid-errors.log', logMessage);
    
    res.status(500).json({
      success: false,
      error: {
        message: 'Error placing bid',
        code: 'BID_ERROR',
        details: error.message
      }
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
 * Get user's bids
 */
export const getUserBids = async (req, res) => {
  try {
    // Find all bids where the encrypted bidderId matches the user
    const allBids = await Bid.find({}).populate('auctionId');
    
    // Filter bids that belong to this user (decrypt and compare)
    const userBids = allBids.filter(bid => {
      const decryptedBidderId = bid.getBidderId();
      return decryptedBidderId === req.userId;
    });
    
    const bidsData = userBids.map(bid => bid.toSelfObject());
    
    res.json({
      success: true,
      data: bidsData,
      count: bidsData.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching user bids',
        code: 'FETCH_ERROR'
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
    
    // Check if user is the seller
    if (phone.sellerId.toString() !== req.userId && req.userRole !== 'admin') {
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
      return res.status(400).json({
        success: false,
        error: {
          message: 'Auction is not active',
          code: 'AUCTION_NOT_ACTIVE'
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
    
    // Send email notification to winner
    if (winner && winner.email) {
      try {
        const phoneDetails = {
          brand: phone.brand,
          model: phone.model,
          storage: phone.storage,
          condition: phone.condition
        };
        
        await sendBidAcceptanceEmail(
          winner.email,
          winner.name,
          phoneDetails,
          bid.bidAmount
        );
        
        console.log(`✅ Bid acceptance email sent to ${winner.email}`);
      } catch (emailError) {
        console.error('Failed to send bid acceptance email:', emailError);
        // Don't fail the request if email fails
      }
    }
    
    res.json({
      success: true,
      message: 'Bid accepted successfully. Auction ended. Winner has been notified via email.',
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
