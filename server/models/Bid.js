import mongoose from 'mongoose';
import { encrypt, decrypt, generateAnonymousId } from '../services/encryptionService.js';

const bidSchema = new mongoose.Schema({
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },
  
  // Bidder identity (encrypted)
  bidderId: {
    type: String, // Stored encrypted (ObjectId as string)
    required: true
  },
  anonymousBidderId: {
    type: String, // Public anonymous ID (e.g., "BIDDER_ABC")
    required: true
  },
  
  // Bid details
  bidAmount: {
    type: Number,
    required: true,
    min: 0
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  
  // Status
  isWinning: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
bidSchema.index({ auctionId: 1, bidAmount: -1 });
bidSchema.index({ bidderId: 1 });
bidSchema.index({ timestamp: 1 });

// Pre-save hook to encrypt bidderId and generate anonymousBidderId
bidSchema.pre('save', function(next) {
  // Generate anonymous bidder ID if not present
  if (!this.anonymousBidderId) {
    this.anonymousBidderId = generateAnonymousId('BIDDER', 8);
  }
  next();
});

// Method to set bidder (encrypts the ID)
bidSchema.methods.setBidder = function(bidderId) {
  if (bidderId) {
    this.bidderId = encrypt(bidderId.toString());
  }
};

// Method to get bidder ID (decrypts)
bidSchema.methods.getBidderId = function() {
  if (this.bidderId) {
    try {
      return decrypt(this.bidderId);
    } catch (error) {
      console.error('Error decrypting bidder ID:', error.message);
      return null;
    }
  }
  return null;
};

// Method to get public bid data (for non-admin, non-self users)
bidSchema.methods.toPublicObject = function() {
  return {
    _id: this._id,
    auctionId: this.auctionId,
    anonymousBidderId: this.anonymousBidderId,
    bidAmount: this.bidAmount,
    timestamp: this.timestamp,
    isWinning: this.isWinning
  };
};

// Method to get self view (includes real bidder ID for the bidder themselves)
bidSchema.methods.toSelfObject = function() {
  return {
    _id: this._id,
    auctionId: this.auctionId,
    bidderId: this.getBidderId(), // Decrypted for self
    anonymousBidderId: this.anonymousBidderId,
    bidAmount: this.bidAmount,
    timestamp: this.timestamp,
    isWinning: this.isWinning,
    createdAt: this.createdAt
  };
};

// Method to get admin view (includes decrypted bidder ID)
bidSchema.methods.toAdminObject = function() {
  return {
    _id: this._id,
    auctionId: this.auctionId,
    bidderId: this.getBidderId(), // Decrypted
    anonymousBidderId: this.anonymousBidderId,
    bidAmount: this.bidAmount,
    timestamp: this.timestamp,
    isWinning: this.isWinning,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

export default mongoose.model('Bid', bidSchema);