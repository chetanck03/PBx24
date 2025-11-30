import mongoose from 'mongoose';
import { encrypt, decrypt, generateAnonymousId } from '../services/encryptionService.js';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    sparse: true
  },
  email: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String
  },
  avatar: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['user', 'admin'], // 'user' can both buy and sell
    default: 'user'
  },
  // Anonymous ID for privacy
  anonymousId: {
    type: String,
    sparse: true
  },
  // Encrypted sensitive fields
  phone: {
    type: String, // Stored encrypted
    default: ''
  },
  address: {
    type: String, // Stored encrypted
    default: ''
  },
  // Wallet and verification
  walletBalance: {
    type: Number,
    default: 0,
    min: 0
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'verified', 'rejected'],
    default: 'pending'
  },
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isBanned: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
// Note: email, googleId, and anonymousId already have indexes from unique/sparse
// userSchema.index({ email: 1 });
// userSchema.index({ googleId: 1 });
// userSchema.index({ anonymousId: 1 });
userSchema.index({ role: 1 });

// Pre-save hook to generate anonymousId
userSchema.pre('save', function(next) {
  // Generate anonymousId if not present
  if (!this.anonymousId) {
    this.anonymousId = generateAnonymousId('USER', 8);
  }
  next();
});

// Method to encrypt phone number
userSchema.methods.setPhone = function(phoneNumber) {
  if (phoneNumber) {
    this.phone = encrypt(phoneNumber);
  }
};

// Method to decrypt phone number
userSchema.methods.getPhone = function() {
  if (this.phone) {
    try {
      return decrypt(this.phone);
    } catch (error) {
      console.error('Error decrypting phone:', error.message);
      return null;
    }
  }
  return null;
};

// Method to encrypt address
userSchema.methods.setAddress = function(addressText) {
  if (addressText) {
    this.address = encrypt(addressText);
  }
};

// Method to decrypt address
userSchema.methods.getAddress = function() {
  if (this.address) {
    try {
      return decrypt(this.address);
    } catch (error) {
      console.error('Error decrypting address:', error.message);
      return null;
    }
  }
  return null;
};

// Method to get safe user data (for non-admin, non-self access)
userSchema.methods.toSafeObject = function() {
  return {
    anonymousId: this.anonymousId,
    role: this.role,
    isActive: this.isActive
  };
};

// Method to get full user data (for admin or self access)
userSchema.methods.toFullObject = function() {
  return {
    _id: this._id,
    googleId: this.googleId,
    email: this.email,
    name: this.name,
    avatar: this.avatar,
    role: this.role,
    anonymousId: this.anonymousId,
    phone: this.getPhone(),
    address: this.getAddress(),
    walletBalance: this.walletBalance,
    kycStatus: this.kycStatus,
    isActive: this.isActive,
    isBanned: this.isBanned,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

export default mongoose.model('User', userSchema);