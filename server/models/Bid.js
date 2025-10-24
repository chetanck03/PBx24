import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  bidder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  isWinning: {
    type: Boolean,
    default: false
  },
  isSelected: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'outbid', 'winning', 'selected', 'rejected'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Index for efficient queries
bidSchema.index({ listing: 1, amount: -1 });
bidSchema.index({ bidder: 1 });

export default mongoose.model('Bid', bidSchema);