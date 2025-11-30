import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { phoneAPI, auctionAPI, bidAPI } from '../services/api';

const PhoneDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [phone, setPhone] = useState(null);
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadPhoneDetails();
  }, [id]);

  const loadPhoneDetails = async () => {
    try {
      setLoading(true);
      const [phoneRes, auctionRes] = await Promise.all([
        phoneAPI.getPhoneById(id),
        auctionAPI.getAuctionByPhoneId(id).catch(() => null)
      ]);
      
      setPhone(phoneRes.data.data);
      
      if (auctionRes?.data?.data) {
        setAuction(auctionRes.data.data);
        
        // Load bids
        try {
          const bidsRes = await bidAPI.getAuctionBids(auctionRes.data.data._id);
          setBids(bidsRes.data.data || []);
        } catch (bidError) {
          console.error('Error loading bids:', bidError);
          setBids([]);
        }
      }
    } catch (error) {
      console.error('Error loading phone:', error);
      setError('Failed to load phone details');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!auction) {
      setError('No active auction for this phone');
      return;
    }
    
    const amount = parseFloat(bidAmount);
    const minBid = Math.max(auction.currentBid, phone.minBidPrice) + 1;
    
    if (amount < minBid) {
      setError(`Bid must be at least ₹${minBid}`);
      return;
    }
    
    try {
      setSubmitting(true);
      await bidAPI.placeBid(auction._id, amount);
      setSuccess('Bid placed successfully!');
      setBidAmount('');
      
      // Reload data
      setTimeout(() => {
        loadPhoneDetails();
        setSuccess('');
      }, 1500);
    } catch (error) {
      console.error('Bid error:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.error?.message || 
                          error.response?.data?.message ||
                          error.message ||
                          'Failed to place bid';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Live countdown timer
  const [timeRemaining, setTimeRemaining] = useState('');
  
  useEffect(() => {
    if (!auction) return;
    
    const updateTimer = () => {
      const now = new Date();
      const end = new Date(auction.auctionEndTime);
      const diff = end - now;
      
      if (diff <= 0) {
        setTimeRemaining('Auction Ended');
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      if (days > 0) {
        setTimeRemaining(`${days}d ${hours}h ${minutes}m ${seconds}s`);
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeRemaining(`${minutes}m ${seconds}s`);
      }
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [auction]);
  
  // Auto-refresh bids every 5 seconds
  useEffect(() => {
    if (!auction) return;
    
    const interval = setInterval(() => {
      loadPhoneDetails();
    }, 5000);
    
    return () => clearInterval(interval);
  }, [auction]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading phone details...</p>
        </div>
      </div>
    );
  }

  if (!phone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-gray-600">Phone not found</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/marketplace')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Images */}
          <div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Main Image */}
              <div className="h-96 bg-gray-200">
                {phone.images && phone.images[selectedImage] ? (
                  <img
                    src={phone.images[selectedImage]}
                    alt={`${phone.brand} ${phone.model}`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-gray-400">No Image</span>
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {phone.images && phone.images.length > 1 && (
                <div className="p-4 grid grid-cols-6 gap-2">
                  {phone.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`h-16 rounded-lg overflow-hidden border-2 ${
                        selectedImage === index ? 'border-blue-600' : 'border-gray-200'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mt-6 bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-3">Description</h3>
              <p className="text-gray-700 whitespace-pre-wrap">{phone.description}</p>
            </div>
          </div>

          {/* Right Column - Details & Bidding */}
          <div className="space-y-6">
            {/* Phone Info */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                {phone.brand} {phone.model}
              </h1>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Storage</p>
                  <p className="text-lg font-semibold">{phone.storage}</p>
                </div>
                {phone.ram && (
                  <div>
                    <p className="text-sm text-gray-600">RAM</p>
                    <p className="text-lg font-semibold">{phone.ram}</p>
                  </div>
                )}
                {phone.color && (
                  <div>
                    <p className="text-sm text-gray-600">Color</p>
                    <p className="text-lg font-semibold">{phone.color}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Condition</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    phone.condition === 'excellent' ? 'bg-green-100 text-green-800' :
                    phone.condition === 'good' ? 'bg-blue-100 text-blue-800' :
                    phone.condition === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {phone.condition}
                  </span>
                </div>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm text-gray-600">Seller (Anonymous)</p>
                <p className="text-lg font-semibold text-blue-600">{phone.anonymousSellerId}</p>
              </div>
            </div>

            {/* Auction Info & Bidding */}
            {auction && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">Auction Details</h2>
                  {auction.status === 'active' && new Date() < new Date(auction.auctionEndTime) && (
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-semibold text-red-600">LIVE</span>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Current Bid:</span>
                    <span className="text-2xl font-bold text-blue-600">
                      ₹{auction.currentBid || phone.minBidPrice}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Minimum Bid:</span>
                    <span className="text-lg font-semibold">₹{phone.minBidPrice}</span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Bids:</span>
                    <span className="text-lg font-semibold">{auction.totalBids}</span>
                  </div>
                  
                  {auction.anonymousLeadingBidder && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Leading Bidder:</span>
                      <span className="text-lg font-semibold text-green-600">
                        {auction.anonymousLeadingBidder}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Time Remaining:</span>
                    <span className={`text-lg font-semibold ${
                      timeRemaining === 'Auction Ended' ? 'text-gray-600' : 'text-red-600'
                    }`}>
                      {timeRemaining || 'Loading...'}
                    </span>
                  </div>
                </div>

                {/* Bid Form */}
                {auction.status === 'active' && new Date() < new Date(auction.auctionEndTime) && (
                  <form onSubmit={handlePlaceBid} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Bid Amount
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">₹</span>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder={`Min: ${Math.max(auction.currentBid, phone.minBidPrice) + 1}`}
                          className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    )}

                    {success && (
                      <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-600">{success}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Placing Bid...' : 'Place Bid'}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Bid History */}
            {bids.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Bid History</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {bids.map((bid, index) => (
                    <div key={bid._id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold text-gray-900">{bid.anonymousBidderId}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(bid.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">₹{bid.bidAmount}</p>
                        {bid.isWinning && (
                          <span className="text-xs text-green-600 font-semibold">Leading</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhoneDetail;
