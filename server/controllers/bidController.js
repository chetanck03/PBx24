import Bid from '../models/Bid.js';
import Listing from '../models/Listing.js';
import Transaction from '../models/Transaction.js';
import Notification from '../models/Notification.js';

// Place a bid
export const placeBid = async (req, res) => {
  try {
    const { listingId, amount } = req.body;

    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({
        success: false,
        error: { message: 'Listing not found' }
      });
    }

    // Check if auction is still active
    if (listing.status !== 'active' || new Date() > listing.auctionEndTime) {
      return res.status(400).json({
        success: false,
        error: { message: 'Auction has ended' }
      });
    }

    // Check if user is not the seller
    if (listing.seller.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot bid on your own listing' }
      });
    }

    // Check if bid amount is higher than current highest bid
    const minBidAmount = Math.max(listing.currentHighestBid, listing.startingPrice) + 1;
    if (amount < minBidAmount) {
      return res.status(400).json({
        success: false,
        error: { message: `Bid must be at least $${minBidAmount}` }
      });
    }

    // Update previous winning bid status
    await Bid.updateMany(
      { listing: listingId, isWinning: true },
      { isWinning: false, status: 'outbid' }
    );

    // Create new bid
    const bid = new Bid({
      listing: listingId,
      bidder: req.user._id,
      amount,
      isWinning: true,
      status: 'winning'
    });

    await bid.save();

    // Update listing's current highest bid
    listing.currentHighestBid = amount;
    await listing.save();

    await bid.populate('bidder', 'name avatar');

    // Create notifications (implement socket.io later)
    // Notify seller about new bid
    const sellerNotification = new Notification({
      recipient: listing.seller,
      type: 'new_bid',
      title: 'New Bid Received',
      message: `${req.user.name} placed a bid of $${amount} on your listing`,
      relatedListing: listingId,
      relatedBid: bid._id
    });
    await sellerNotification.save();

    res.status(201).json({
      success: true,
      data: { bid }
    });
  } catch (error) {
    console.error('Place bid error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to place bid' }
    });
  }
};

// Get bids for a listing
export const getListingBids = async (req, res) => {
  try {
    const bids = await Bid.find({ listing: req.params.listingId })
      .populate('bidder', 'name avatar')
      .sort({ amount: -1 });

    res.json({
      success: true,
      data: { bids }
    });
  } catch (error) {
    console.error('Get listing bids error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch bids' }
    });
  }
};

// Get user's bids
export const getUserBids = async (req, res) => {
  try {
    const bids = await Bid.find({ bidder: req.user._id })
      .populate('listing', 'title brand model images status auctionEndTime')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { bids }
    });
  } catch (error) {
    console.error('Get user bids error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch user bids' }
    });
  }
};

// Select winning bid (seller only)
export const selectWinningBid = async (req, res) => {
  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId).populate('listing');
    if (!bid) {
      return res.status(404).json({
        success: false,
        error: { message: 'Bid not found' }
      });
    }

    const listing = bid.listing;

    // Check if user is the seller
    if (listing.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { message: 'Only the seller can select winning bid' }
      });
    }

    // Check if listing is still active
    if (listing.status !== 'active') {
      return res.status(400).json({
        success: false,
        error: { message: 'Listing is no longer active' }
      });
    }

    // Update bid status
    bid.isSelected = true;
    bid.status = 'selected';
    await bid.save();

    // Update listing status
    listing.status = 'sold';
    await listing.save();

    // Create transaction
    const transaction = new Transaction({
      listing: listing._id,
      seller: listing.seller,
      buyer: bid.bidder,
      winningBid: bid._id,
      amount: bid.amount
    });
    await transaction.save();

    // Create notification for buyer
    const buyerNotification = new Notification({
      recipient: bid.bidder,
      type: 'bid_selected',
      title: 'Congratulations! Your bid was selected',
      message: `Your bid of $${bid.amount} was selected for ${listing.title}`,
      relatedListing: listing._id,
      relatedBid: bid._id
    });
    await buyerNotification.save();

    res.json({
      success: true,
      data: { bid, transaction }
    });
  } catch (error) {
    console.error('Select winning bid error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to select winning bid' }
    });
  }
};