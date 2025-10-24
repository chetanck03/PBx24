import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../config/api';
import config from '../config/env.js';
import LoadingSpinner from '../components/common/LoadingSpinner';
import BidForm from '../components/marketplace/BidForm';
import { ArrowLeft, Clock, User, Package, DollarSign } from 'lucide-react';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [listing, setListing] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListingDetails();
  }, [id]);

  const fetchListingDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(config.endpoints.listings.detail(id));
      
      if (response.data.success) {
        setListing(response.data.data.listing);
        setBids(response.data.data.bids);
      }
    } catch (error) {
      console.error('Failed to fetch listing details:', error);
      navigate('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const handleBidPlaced = (newBid) => {
    setBids(prev => [newBid, ...prev]);
    setListing(prev => ({
      ...prev,
      currentHighestBid: newBid.amount
    }));
  };

  const handleSelectBid = async (bidId) => {
    try {
      const response = await api.put(`${config.endpoints.bids.base}/${bidId}/select`);
      if (response.data.success) {
        // Refresh the listing details to show updated status
        fetchListingDetails();
      }
    } catch (error) {
      console.error('Failed to select bid:', error);
    }
  };

  const timeRemaining = () => {
    if (!listing) return '';
    
    const now = new Date();
    const endTime = new Date(listing.auctionEndTime);
    const diff = endTime - now;
    
    if (diff <= 0) return 'Auction Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days} days, ${hours} hours remaining`;
    if (hours > 0) return `${hours} hours, ${minutes} minutes remaining`;
    return `${minutes} minutes remaining`;
  };

  const getConditionColor = (condition) => {
    const colors = {
      'new': 'bg-green-100 text-green-800',
      'like-new': 'bg-blue-100 text-blue-800',
      'good': 'bg-yellow-100 text-yellow-800',
      'fair': 'bg-orange-100 text-orange-800',
      'poor': 'bg-red-100 text-red-800'
    };
    return colors[condition] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Listing not found
          </h2>
          <button
            onClick={() => navigate('/marketplace')}
            className="text-blue-600 hover:text-blue-800"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  const isOwner = user && listing.seller._id === user.id;
  const auctionEnded = new Date() > new Date(listing.auctionEndTime);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Images */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="aspect-w-16 aspect-h-12 bg-gray-200 rounded-lg mb-4">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                    <Package className="h-16 w-16 text-gray-400" />
                  </div>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {listing.title}
                  </h1>
                  <p className="text-lg text-gray-600">
                    {listing.brand} {listing.model}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getConditionColor(listing.condition)}`}>
                  {listing.condition.charAt(0).toUpperCase() + listing.condition.slice(1)}
                </span>
              </div>

              <div className="prose max-w-none">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Description
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {listing.description}
                </p>
              </div>

              {/* Specifications */}
              {Object.keys(listing.specifications).some(key => listing.specifications[key]) && (
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Specifications
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {Object.entries(listing.specifications).map(([key, value]) => (
                      value && (
                        <div key={key} className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium text-gray-600 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                          <p className="text-gray-900">{value}</p>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bids History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Bid History ({bids.length})
              </h3>
              {bids.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No bids yet. Be the first to bid!
                </p>
              ) : (
                <div className="space-y-3">
                  {bids.map((bid, index) => (
                    <div key={bid._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          {bid.bidder.avatar ? (
                            <img
                              src={bid.bidder.avatar}
                              alt={bid.bidder.name}
                              className="h-8 w-8 rounded-full"
                            />
                          ) : (
                            <User className="h-8 w-8 text-gray-400" />
                          )}
                          <span className="font-medium text-gray-900">
                            {bid.bidder.name}
                          </span>
                        </div>
                        {index === 0 && !bid.isSelected && (
                          <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                            Highest Bid
                          </span>
                        )}
                        {bid.isSelected && (
                          <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                            Selected Winner
                          </span>
                        )}
                      </div>
                      <div className="text-right flex items-center space-x-3">
                        <div>
                          <p className="font-bold text-lg text-green-600">
                            ${bid.amount}
                          </p>
                          <p className="text-sm text-gray-500">
                            {new Date(bid.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        {isOwner && listing.status === 'active' && !bid.isSelected && (
                          <button
                            onClick={() => handleSelectBid(bid._id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                          >
                            Accept
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Auction Info */}
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <div className="text-center mb-6">
                <p className="text-sm text-gray-500 mb-1">Current Highest Bid</p>
                <p className="text-3xl font-bold text-green-600">
                  ${listing.currentHighestBid || listing.startingPrice}
                </p>
                <p className="text-sm text-gray-500">
                  Starting price: ${listing.startingPrice}
                </p>
              </div>

              <div className="flex items-center justify-center mb-6">
                <Clock className="h-5 w-5 text-gray-400 mr-2" />
                <span className={`font-medium ${auctionEnded ? 'text-red-600' : 'text-gray-900'}`}>
                  {timeRemaining()}
                </span>
              </div>

              {/* Bid Form */}
              {isAuthenticated && !isOwner && !auctionEnded && listing.status === 'active' && (
                <BidForm
                  listingId={listing._id}
                  currentHighestBid={listing.currentHighestBid || listing.startingPrice}
                  onBidPlaced={handleBidPlaced}
                />
              )}

              {!isAuthenticated && (
                <div className="text-center">
                  <p className="text-gray-600 mb-4">
                    Sign in to place a bid
                  </p>
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Sign In
                  </button>
                </div>
              )}

              {isOwner && (
                <div className="text-center">
                  <p className="text-gray-600">
                    This is your listing
                  </p>
                </div>
              )}

              {auctionEnded && (
                <div className="text-center">
                  <p className="text-red-600 font-medium">
                    Auction has ended
                  </p>
                </div>
              )}
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Seller Information
              </h3>
              <div className="flex items-center space-x-3">
                {listing.seller.avatar ? (
                  <img
                    src={listing.seller.avatar}
                    alt={listing.seller.name}
                    className="h-12 w-12 rounded-full"
                  />
                ) : (
                  <User className="h-12 w-12 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {listing.seller.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    Member since {new Date(listing.createdAt).getFullYear()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;