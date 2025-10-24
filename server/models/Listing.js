import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  brand: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    enum: ['new', 'like-new', 'good', 'fair', 'poor'],
    required: true
  },
  images: [{
    type: String
  }],
  startingPrice: {
    type: Number,
    required: true,
    min: 0
  },
  currentHighestBid: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'expired', 'cancelled'],
    default: 'active'
  },
  auctionEndTime: {
    type: Date,
    required: true
  },
  specifications: {
    storage: String,
    color: String,
    screenSize: String,
    battery: String,
    camera: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
listingSchema.index({ status: 1, auctionEndTime: 1 });
listingSchema.index({ seller: 1 });

export default mongoose.model('Listing', listingSchema);