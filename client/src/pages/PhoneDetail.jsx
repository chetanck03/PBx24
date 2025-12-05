import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { phoneAPI, auctionAPI, bidAPI } from '../services/api';
import Footer from '../components/common/Footer';
import { ArrowLeft, HardDrive, Cpu, Palette, CheckCircle, MapPin, User, Clock, Trophy } from 'lucide-react';

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
      
      setTimeout(() => {
        loadPhoneDetails();
        setSuccess('');
      }, 1500);
    } catch (error) {
      console.error('Bid error:', error);
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
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: false });
  
  useEffect(() => {
    if (!auction) return;
    
    const updateTimer = () => {
      const now = new Date();
      const end = new Date(auction.auctionEndTime);
      const diff = end - now;
      
      if (diff <= 0) {
        setTimeRemaining({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: true });
        return;
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setTimeRemaining({ days, hours, minutes, seconds, ended: false });
    };
    
    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    
    return () => clearInterval(interval);
  }, [auction]);
  
  // Auto-refresh bids every 30 seconds (reduced from 5s to prevent constant reloading)
  useEffect(() => {
    if (!auction || timeRemaining.ended) return;
    
    const interval = setInterval(() => {
      // Only refresh bids, not the entire page
      refreshBids();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [auction?._id, timeRemaining.ended]);

  const refreshBids = useCallback(async () => {
    if (!auction) return;
    try {
      const [auctionRes, bidsRes] = await Promise.all([
        auctionAPI.getAuctionByPhoneId(id).catch(() => null),
        bidAPI.getAuctionBids(auction._id).catch(() => ({ data: { data: [] } }))
      ]);
      if (auctionRes?.data?.data) setAuction(auctionRes.data.data);
      setBids(bidsRes.data.data || []);
    } catch (error) {
      console.error('Error refreshing bids:', error);
    }
  }, [auction, id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c4ff0d] mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading phone details...</p>
        </div>
      </div>
    );
  }

  if (!phone) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <p className="text-xl text-gray-400 mb-4">Phone not found</p>
          <button
            onClick={() => navigate('/marketplace')}
            className="px-6 py-3 bg-[#c4ff0d] text-black rounded-lg hover:bg-[#d4ff3d] font-semibold transition"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 lg:py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/marketplace')}
          className="mb-6 flex items-center gap-2 text-gray-400 hover:text-[#c4ff0d] transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Marketplace
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-8">
          {/* Left Column - Phone Info & Auction */}
          <div className="space-y-4 lg:space-y-6 order-2 lg:order-1">
            {/* Phone Title & Specs */}
            <div>
              <h1 className="text-4xl font-bold text-white mb-6">
                {phone.brand} {phone.model}
              </h1>
              
              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <HardDrive className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Storage:</p>
                    <p className="text-white font-semibold">{phone.storage}</p>
                  </div>
                </div>
                
                {phone.ram && (
                  <div className="flex items-center gap-3">
                    <Cpu className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">RAM:</p>
                      <p className="text-white font-semibold">{phone.ram}</p>
                    </div>
                  </div>
                )}
                
                {phone.color && (
                  <div className="flex items-center gap-3">
                    <Palette className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-xs text-gray-500">Color:</p>
                      <p className="text-white font-semibold">{phone.color}</p>
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Condition:</p>
                    <p className="text-white font-semibold capitalize">{phone.condition}</p>
                  </div>
                </div>
              </div>

              {/* Seller Info */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Seller (Anonymous)</p>
                <p className="text-[#c4ff0d] font-semibold">{phone.anonymousSellerId}</p>
              </div>

              {phone.location && (
                <div className="flex items-center gap-2 text-gray-400 mb-6">
                  <MapPin className="w-4 h-4" />
                  <span>{phone.location}</span>
                </div>
              )}
            </div>

            {/* Auction Details Box */}
            {auction && (
              <div className="bg-[#0f0f0f] border-2 border-[#c4ff0d] rounded-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-white">Auction Details</h2>
                  {auction.status === 'active' && !timeRemaining.ended && (
                    <span className="bg-[#c4ff0d] text-black text-xs font-bold px-3 py-1 rounded">
                      LIVE
                    </span>
                  )}
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-1">Current Bid:</p>
                  <p className="text-5xl font-bold text-[#c4ff0d]">
                    ₹{(auction.currentBid || phone.minBidPrice).toLocaleString()}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-400">Minimum Bid:</p>
                    <p className="text-white font-semibold">₹{phone.minBidPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Total Bids:</p>
                    <p className="text-white font-semibold">{auction.totalBids}</p>
                  </div>
                </div>

                {auction.anonymousLeadingBidder && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-400">Leading Bidder:</p>
                    <p className="text-[#c4ff0d] font-semibold">{auction.anonymousLeadingBidder}</p>
                  </div>
                )}

                {/* Time Remaining */}
                <div className="mb-6">
                  <p className="text-sm text-gray-400 mb-2">Time Remaining:</p>
                  {timeRemaining.ended ? (
                    <p className="text-xl font-bold text-red-500">Auction Ended</p>
                  ) : (
                    <div className="bg-[#1a1a1a] border border-[#c4ff0d] rounded-xl px-4 py-3 inline-block">
                      <span className="text-2xl font-bold text-[#c4ff0d]">
                        {timeRemaining.days > 0 && `${timeRemaining.days}d `}
                        {timeRemaining.hours}h {timeRemaining.minutes}m {timeRemaining.seconds}s
                      </span>
                    </div>
                  )}
                </div>

                {/* Bid Form */}
                {auction.status === 'active' && !timeRemaining.ended && (
                  <form onSubmit={handlePlaceBid} className="space-y-4">
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
                        <input
                          type="number"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder="Your Bid Amount"
                          className="w-full pl-8 pr-4 py-3 bg-[#1a1a1a] border-2 border-[#c4ff0d] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#c4ff0d] transition"
                          required
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={submitting}
                        className="px-8 py-3 bg-[#c4ff0d] text-black rounded-xl font-bold hover:bg-[#d4ff3d] transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? 'Placing...' : 'Place Bid'}
                      </button>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-xl">
                        <p className="text-sm text-red-400">{error}</p>
                      </div>
                    )}

                    {success && (
                      <div className="p-3 bg-green-500/10 border border-green-500/50 rounded-xl">
                        <p className="text-sm text-green-400">{success}</p>
                      </div>
                    )}
                  </form>
                )}
              </div>
            )}

            {/* Description */}
            {phone.description && (
              <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-6">
                <h3 className="text-lg font-bold text-white mb-3">Description</h3>
                <p className="text-gray-400 whitespace-pre-wrap">{phone.description}</p>
              </div>
            )}
          </div>

          {/* Right Column - Images & Bid History */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl overflow-hidden">
              <div className="h-96 bg-[#1a1a1a]">
                {phone.images && phone.images[selectedImage] ? (
                  <img
                    src={phone.images[selectedImage]}
                    alt={`${phone.brand} ${phone.model}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <span className="text-gray-600">No Image</span>
                  </div>
                )}
              </div>
              
              {/* Thumbnail Gallery */}
              {phone.images && phone.images.length > 1 && (
                <div className="p-4 flex gap-2 overflow-x-auto">
                  {phone.images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        selectedImage === index 
                          ? 'border-[#c4ff0d]' 
                          : 'border-[#2a2a2a] hover:border-gray-600'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${index + 1}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Bid History */}
            <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Bid History</h3>
              
              {bids.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">No bids yet. Be the first to bid!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto pr-2">
                  {bids.map((bid) => (
                    <div 
                      key={bid._id} 
                      className={`p-4 rounded-xl border ${
                        bid.isWinning 
                          ? 'bg-[#c4ff0d]/10 border-[#c4ff0d]' 
                          : 'bg-[#1a1a1a] border-[#2a2a2a]'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          {bid.isWinning && (
                            <span className="inline-flex items-center gap-1 bg-[#c4ff0d] text-black text-xs font-bold px-2 py-1 rounded mb-2">
                              <Trophy className="w-3 h-3" />
                              Leading
                            </span>
                          )}
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-500" />
                            <p className="font-semibold text-white">{bid.anonymousBidderId}</p>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(bid.timestamp).toLocaleDateString()}, {new Date(bid.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                        <p className={`text-xl font-bold ${bid.isWinning ? 'text-[#c4ff0d]' : 'text-white'}`}>
                          ₹{bid.bidAmount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PhoneDetail;
