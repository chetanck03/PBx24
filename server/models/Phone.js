import mongoose from 'mongoose';
import { encrypt, decrypt } from '../services/encryptionService.js';

const phoneSchema = new mongoose.Schema({
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
  
  // Phone details
  brand: {
    type: String,
    required: true,
    trim: true
  },
  model: {
    type: String,
    required: true,
    trim: true
  },
  storage: {
    type: String,
    required: true
  },
  ram: {
    type: String
  },
  color: {
    type: String
  },
  
  // Included accessories
  accessories: {
    charger: {
      type: Boolean,
      default: false
    },
    bill: {
      type: Boolean,
      default: false
    },
    box: {
      type: Boolean,
      default: false
    }
  },
  
  // Encrypted sensitive data
  imei: {
    type: String, // Stored encrypted
    required: true
  },
  
  // Listing details
  condition: {
    type: String,
    enum: ['Excellent', 'Good', 'Fair', 'Poor', 'excellent', 'good', 'fair', 'poor'],
    required: true
  },
  images: {
    type: [String],
    required: true,
    validate: {
      validator: function(images) {
        return images && images.length >= 2 && images.length <= 6;
      },
      message: 'Between 2 and 6 images are required'
    }
  },
  description: {
    type: String,
    required: true
  },
  minBidPrice: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Verification
  verificationStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String,
    default: ''
  },
  
  // Auction timing
  auctionStartTime: {
    type: Date
  },
  auctionEndTime: {
    type: Date
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'pending', 'live', 'ended', 'sold', 'cancelled'],
    default: 'draft'
  },
  
  // Location
  location: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
phoneSchema.index({ sellerId: 1 });
phoneSchema.index({ anonymousSellerId: 1 });
phoneSchema.index({ status: 1, auctionEndTime: 1 });
phoneSchema.index({ verificationStatus: 1 });
phoneSchema.index({ brand: 1, model: 1 });
phoneSchema.index({ location: 1 });

// Pre-save hook to set anonymousSellerId from seller's anonymousId
phoneSchema.pre('save', async function(next) {
  if (this.isModified('sellerId') && !this.anonymousSellerId) {
    try {
      const User = mongoose.model('User');
      const seller = await User.findById(this.sellerId);
      if (seller && seller.anonymousId) {
        this.anonymousSellerId = seller.anonymousId;
      }
    } catch (error) {
      console.error('Error setting anonymousSellerId:', error.message);
    }
  }
  next();
});

// Method to encrypt IMEI
phoneSchema.methods.setImei = function(imeiNumber) {
  if (imeiNumber) {
    this.imei = encrypt(imeiNumber);
  }
};

// Method to decrypt IMEI
phoneSchema.methods.getImei = function() {
  if (this.imei) {
    try {
      return decrypt(this.imei);
    } catch (error) {
      console.error('Error decrypting IMEI:', error.message);
      return null;
    }
  }
  return null;
};

// Method to get public phone data (for non-admin users)
phoneSchema.methods.toPublicObject = function() {
  return {
    _id: this._id,
    anonymousSellerId: this.anonymousSellerId,
    brand: this.brand,
    model: this.model,
    storage: this.storage,
    ram: this.ram,
    color: this.color,
    condition: this.condition,
    accessories: this.accessories,
    images: this.images,
    description: this.description,
    minBidPrice: this.minBidPrice,
    auctionStartTime: this.auctionStartTime,
    auctionEndTime: this.auctionEndTime,
    auctionStatus: this.status,
    status: this.status,
    location: this.location,
    createdAt: this.createdAt
  };
};

// Method to get seller's view (includes verification status but not IMEI)
phoneSchema.methods.toSellerObject = function() {
  return {
    ...this.toPublicObject(),
    sellerId: this.sellerId,
    verificationStatus: this.verificationStatus,
    adminNotes: this.adminNotes,
    accessories: this.accessories,
    location: this.location,
    updatedAt: this.updatedAt
  };
};

// Method to get admin view (includes everything decrypted)
phoneSchema.methods.toAdminObject = function() {
  return {
    _id: this._id,
    sellerId: this.sellerId,
    anonymousSellerId: this.anonymousSellerId,
    brand: this.brand,
    model: this.model,
    storage: this.storage,
    ram: this.ram,
    color: this.color,
    imei: this.getImei(), // Decrypted
    condition: this.condition,
    accessories: this.accessories,
    images: this.images,
    description: this.description,
    minBidPrice: this.minBidPrice,
    verificationStatus: this.verificationStatus,
    adminNotes: this.adminNotes,
    auctionStartTime: this.auctionStartTime,
    auctionEndTime: this.auctionEndTime,
    status: this.status,
    location: this.location,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

export default mongoose.model('Phone', phoneSchema);
