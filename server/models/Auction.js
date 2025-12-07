import mongoose from 'mongoose';
import { encrypt, decrypt } from '../services/encryptionService.js';

const auctionSchema = new mongoose.Schema({
  // Phone reference
  phoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Phone',
    required: true
  },
  
  // Seller information
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  anonymousSellerId: {
    type: String,
    required: true
  },
  
  // Starting bid
  startingBid: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Bidding state
  currentBid: {
    type: Number,
    default: 0,
    min: 0
  },
  totalBids: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Bids array
  bids: [{
    bidderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    anonymousBidderId: String,
    amount: Number,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Leading bidder (encrypted for privacy)
  leadingBidderId: {
    type: String, // Stored encrypted (ObjectId as string)
    default: null
  },
  anonymousLeadingBidder: {
    type: String, // Public anonymous ID (e.g., "BIDDER_123")
    default: null
  },
  
  // Timing
  auctionEndTime: {
    type: Date,
    required: true
  },
  
  // Status
  status: {
    type: String,
    enum: ['active', 'ended', 'completed', 'cancelled'],
    default: 'active'
  },
  
  // Winner (set when auction ends)
  winnerId: {
    type: String, // Stored encrypted (ObjectId as string)
    default: null
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
auctionSchema.index({ phoneId: 1 });
auctionSchema.index({ status: 1, auctionEndTime: 1 });
auctionSchema.index({ winnerId: 1 });
auctionSchema.index({ sellerId: 1 });
auctionSchema.index({ createdAt: -1 });

// Method to set leading bidder (encrypts the ID)
auctionSchema.methods.setLeadingBidder = function(bidderId, anonymousBidderId) {
  if (bidderId) {
    this.leadingBidderId = encrypt(bidderId.toString());
    this.anonymousLeadingBidder = anonymousBidderId;
  }
};

// Method to get leading bidder ID (decrypts)
auctionSchema.methods.getLeadingBidderId = function() {
  if (this.leadingBidderId) {
    try {
      return decrypt(this.leadingBidderId);
    } catch (error) {
      console.error('Error decrypting leading bidder ID:', error.message);
      return null;
    }
  }
  return null;
};

// Method to set winner (encrypts the ID)
auctionSchema.methods.setWinner = function(winnerId) {
  if (winnerId) {
    this.winnerId = encrypt(winnerId.toString());
  }
};

// Method to get winner ID (decrypts)
auctionSchema.methods.getWinnerId = function() {
  if (this.winnerId) {
    try {
      return decrypt(this.winnerId);
    } catch (error) {
      console.error('Error decrypting winner ID:', error.message);
      return null;
    }
  }
  return null;
};

// Method to get public auction data (for non-admin users)
auctionSchema.methods.toPublicObject = function() {
  return {
    _id: this._id,
    phoneId: this.phoneId,
    anonymousSellerId: this.anonymousSellerId,
    startingBid: this.startingBid,
    currentBid: this.currentBid,
    totalBids: this.totalBids,
    anonymousLeadingBidder: this.anonymousLeadingBidder,
    auctionEndTime: this.auctionEndTime,
    status: this.status,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Method to get admin view (includes decrypted IDs)
auctionSchema.methods.toAdminObject = function() {
  return {
    _id: this._id,
    phoneId: this.phoneId,
    sellerId: this.sellerId,
    anonymousSellerId: this.anonymousSellerId,
    startingBid: this.startingBid,
    currentBid: this.currentBid,
    totalBids: this.totalBids,
    leadingBidderId: this.getLeadingBidderId(), // Decrypted
    anonymousLeadingBidder: this.anonymousLeadingBidder,
    auctionEndTime: this.auctionEndTime,
    status: this.status,
    winnerId: this.getWinnerId(), // Decrypted
    bids: this.bids,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Method to update bid (increments total, updates leading bidder)
auctionSchema.methods.updateBid = function(bidAmount, bidderId, anonymousBidderId) {
  this.currentBid = bidAmount;
  this.totalBids += 1;
  this.setLeadingBidder(bidderId, anonymousBidderId);
};

export default mongoose.model('Auction', auctionSchema);
