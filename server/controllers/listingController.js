import Listing from '../models/Listing.js';
import Bid from '../models/Bid.js';

// Get all active listings
export const getListings = async (req, res) => {
  try {
    const { page = 1, limit = 12, search, condition, brand } = req.query;
    
    const query = { status: 'active', auctionEndTime: { $gt: new Date() } };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (condition) query.condition = condition;
    if (brand) query.brand = brand;

    const listings = await Listing.find(query)
      .populate('seller', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Listing.countDocuments(query);

    res.json({
      success: true,
      data: {
        listings,
        pagination: {
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });
  } catch (error) {
    console.error('Get listings error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch listings' }
    });
  }
};

// Get single listing with bids
export const getListing = async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id)
      .populate('seller', 'name avatar email');

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: { message: 'Listing not found' }
      });
    }

    // Get bids for this listing
    const bids = await Bid.find({ listing: listing._id })
      .populate('bidder', 'name avatar')
      .sort({ amount: -1 });

    res.json({
      success: true,
      data: { listing, bids }
    });
  } catch (error) {
    console.error('Get listing error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch listing' }
    });
  }
};

// Create new listing
export const createListing = async (req, res) => {
  try {
    const {
      title,
      description,
      brand,
      model,
      condition,
      startingPrice,
      auctionDuration,
      specifications
    } = req.body;

    // Calculate auction end time
    const auctionEndTime = new Date();
    auctionEndTime.setHours(auctionEndTime.getHours() + parseInt(auctionDuration));

    const listing = new Listing({
      seller: req.user._id,
      title,
      description,
      brand,
      model,
      condition,
      startingPrice,
      auctionEndTime,
      specifications: specifications || {}
    });

    await listing.save();
    await listing.populate('seller', 'name avatar');

    res.status(201).json({
      success: true,
      data: { listing }
    });
  } catch (error) {
    console.error('Create listing error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create listing' }
    });
  }
};

// Get user's listings
export const getUserListings = async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user._id })
      .sort({ createdAt: -1 });

    // Get bid counts for each listing
    const listingsWithBids = await Promise.all(
      listings.map(async (listing) => {
        const bidCount = await Bid.countDocuments({ listing: listing._id });
        return {
          ...listing.toObject(),
          bidCount
        };
      })
    );

    res.json({
      success: true,
      data: { listings: listingsWithBids }
    });
  } catch (error) {
    console.error('Get user listings error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch user listings' }
    });
  }
};

// Update listing
export const updateListing = async (req, res) => {
  try {
    const listing = await Listing.findOne({
      _id: req.params.id,
      seller: req.user._id
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: { message: 'Listing not found or unauthorized' }
      });
    }

    // Only allow updates if no bids placed
    const bidCount = await Bid.countDocuments({ listing: listing._id });
    if (bidCount > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot update listing with existing bids' }
      });
    }

    Object.assign(listing, req.body);
    await listing.save();

    res.json({
      success: true,
      data: { listing }
    });
  } catch (error) {
    console.error('Update listing error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update listing' }
    });
  }
};

// Delete listing
export const deleteListing = async (req, res) => {
  try {
    const listing = await Listing.findOne({
      _id: req.params.id,
      seller: req.user._id
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        error: { message: 'Listing not found or unauthorized' }
      });
    }

    // Only allow deletion if no bids placed
    const bidCount = await Bid.countDocuments({ listing: listing._id });
    if (bidCount > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot delete listing with existing bids' }
      });
    }

    await Listing.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      data: { message: 'Listing deleted successfully' }
    });
  } catch (error) {
    console.error('Delete listing error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete listing' }
    });
  }
};