import mongoose from 'mongoose';
import { encrypt, decrypt } from '../services/encryptionService.js';

const transactionSchema = new mongoose.Schema({
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true
  },
  phoneId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Phone',
    required: true
  },
  
  // Parties (encrypted for privacy)
  sellerId: {
    type: String, // Stored encrypted (ObjectId as string)
    required: true
  },
  buyerId: {
    type: String, // Stored encrypted (ObjectId as string)
    required: true
  },
  
  // Financial details
  finalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  platformCommission: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  sellerPayout: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Meeting coordination
  meetingStatus: {
    type: String,
    enum: ['pending', 'seller_completed', 'buyer_completed', 'completed'],
    default: 'pending'
  },
  
  sellerAppointment: {
    date: Date,
    time: String,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed'],
      default: 'pending'
    }
  },
  
  buyerAppointment: {
    date: Date,
    time: String,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed'],
      default: 'pending'
    }
  },
  
  // Escrow
  escrowStatus: {
    type: String,
    enum: ['held', 'released', 'refunded'],
    default: 'held'
  },
  
  // Admin oversight
  adminNotes: {
    type: String,
    default: ''
  },
  
  completedAt: Date
}, {
  timestamps: true
});

// Indexes for efficient queries
transactionSchema.index({ auctionId: 1 });
transactionSchema.index({ sellerId: 1 });
transactionSchema.index({ buyerId: 1 });
transactionSchema.index({ meetingStatus: 1 });
transactionSchema.index({ escrowStatus: 1 });

// Pre-save hook to initialize escrow status
transactionSchema.pre('save', function(next) {
  // Ensure escrow is held on creation
  if (this.isNew && !this.escrowStatus) {
    this.escrowStatus = 'held';
  }
  
  // Update meeting status based on appointments
  if (this.sellerAppointment?.status === 'completed' && 
      this.buyerAppointment?.status === 'completed') {
    this.meetingStatus = 'completed';
    
    // Release escrow when both appointments are completed
    if (this.escrowStatus === 'held') {
      this.escrowStatus = 'released';
    }
    
    // Set completion timestamp
    if (!this.completedAt) {
      this.completedAt = new Date();
    }
  }
  
  next();
});

// Method to set seller (encrypts the ID)
transactionSchema.methods.setSeller = function(sellerId) {
  if (sellerId) {
    this.sellerId = encrypt(sellerId.toString());
  }
};

// Method to get seller ID (decrypts)
transactionSchema.methods.getSellerId = function() {
  if (this.sellerId) {
    try {
      return decrypt(this.sellerId);
    } catch (error) {
      console.error('Error decrypting seller ID:', error.message);
      return null;
    }
  }
  return null;
};

// Method to set buyer (encrypts the ID)
transactionSchema.methods.setBuyer = function(buyerId) {
  if (buyerId) {
    this.buyerId = encrypt(buyerId.toString());
  }
};

// Method to get buyer ID (decrypts)
transactionSchema.methods.getBuyerId = function() {
  if (this.buyerId) {
    try {
      return decrypt(this.buyerId);
    } catch (error) {
      console.error('Error decrypting buyer ID:', error.message);
      return null;
    }
  }
  return null;
};

// Method to get seller view (limited info, no buyer identity)
transactionSchema.methods.toSellerObject = function() {
  return {
    _id: this._id,
    auctionId: this.auctionId,
    phoneId: this.phoneId,
    sellerPayout: this.sellerPayout,
    meetingStatus: this.meetingStatus,
    sellerAppointment: this.sellerAppointment,
    escrowStatus: this.escrowStatus,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Method to get buyer view (limited info, no seller identity)
transactionSchema.methods.toBuyerObject = function() {
  return {
    _id: this._id,
    auctionId: this.auctionId,
    phoneId: this.phoneId,
    finalAmount: this.finalAmount,
    meetingStatus: this.meetingStatus,
    buyerAppointment: this.buyerAppointment,
    escrowStatus: this.escrowStatus,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

// Method to get admin view (includes all decrypted data)
transactionSchema.methods.toAdminObject = function() {
  return {
    _id: this._id,
    auctionId: this.auctionId,
    phoneId: this.phoneId,
    sellerId: this.getSellerId(), // Decrypted
    buyerId: this.getBuyerId(), // Decrypted
    finalAmount: this.finalAmount,
    platformCommission: this.platformCommission,
    sellerPayout: this.sellerPayout,
    meetingStatus: this.meetingStatus,
    sellerAppointment: this.sellerAppointment,
    buyerAppointment: this.buyerAppointment,
    escrowStatus: this.escrowStatus,
    adminNotes: this.adminNotes,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
    completedAt: this.completedAt
  };
};

export default mongoose.model('Transaction', transactionSchema);