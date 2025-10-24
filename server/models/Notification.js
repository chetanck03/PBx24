import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['new_bid', 'outbid', 'auction_end', 'bid_selected', 'transaction_update'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  relatedListing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing'
  },
  relatedBid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
notificationSchema.index({ recipient: 1, isRead: 1 });

export default mongoose.model('Notification', notificationSchema);