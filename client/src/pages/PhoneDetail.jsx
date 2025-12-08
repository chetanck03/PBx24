import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { phoneAPI, auctionAPI, bidAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Footer from '../components/common/Footer';
import { ArrowLeft, HardDrive, Cpu, Palette, CheckCircle, MapPin, User, Clock, Trophy, LogIn, Gavel, AlertTriangle } from 'lucide-react';

const PhoneDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [phone, setPhone] = useState(null);
  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [bidAmount, setBidAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [selectedBidToAccept, setSelectedBidToAccept] = useState(null);
  const [acceptingBid, setAcceptingBid] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, ended: false });

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

  // Check if current user is the seller
  const isOwner = isAuthenticated && user && phone && 
    (user.anonymousId === phone.anonymousSellerId || user._id === phone.sellerId);

  // Check if auction is truly active (not ended, not sold, status is active)
  const isAuctionActive = auction && 
    auction.status === 'active' && 
    !timeRemaining.ended && 
    phone?.status === 'live';

  // Handle accept bid
  const handleAcceptBid = async () => {
    if (!selectedBidToAccept) return;
    
    try {
      setAcceptingBid(true);
      await bidAPI.acceptBid(selectedBidToAccept._id);
      setShowAcceptModal(false);
      setSelectedBidToAccept(null);
      setSuccess('Bid accepted successfully! Confirmation emails have been sent to both parties.');
      
      // Reload phone details to reflect the sold status
      setTimeout(() => {
        loadPhoneDetails();
      }, 2000);
    } catch (error) {
      console.error('Error accepting bid:', error);
      setError(error.response?.data?.error?.message || 'Failed to accept bid');
      setShowAcceptModal(false);
    } finally {
      setAcceptingBid(false);
    }
  };

  const openAcceptModal = async (bid) => {
    // Refresh auction data before showing modal to ensure we have latest status
    try {
      const auctionRes = await auctionAPI.getAuctionByPhoneId(id);
      if (auctionRes?.data?.data) {
        const latestAuction = auctionRes.data.data;
        setAuction(latestAuction);
        
        // Check if auction is still active
        if (latestAuction.status !== 'active') {
          setError(`Cannot accept bid - auction status is: ${latestAuction.status}`);
          return;
        }
      }
    } catch (err) {
      console.error('Error refreshing auction:', err);
    }
    
    setSelectedBidToAccept(bid);
    setShowAcceptModal(true);
  };

  // Live countdown timer
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

              {/* Seller Info - Clickable to view profile */}
              <div className="mb-6">
                <p className="text-sm text-gray-500 mb-1">Seller</p>
                <button
                  onClick={() => navigate(`/user/${phone.anonymousSellerId}`)}
                  className="flex items-center gap-2 text-[#c4ff0d] font-semibold hover:underline transition group"
                >
                  <div className="w-8 h-8 bg-[#c4ff0d]/20 rounded-full flex items-center justify-center group-hover:bg-[#c4ff0d]/30 transition">
                    <User className="w-4 h-4 text-[#c4ff0d]" />
                  </div>
                  <span>@{phone.anonymousSellerId}</span>
                </button>
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
                  {auction.status === 'active' && !timeRemaining.ended ? (
                    <span className="bg-[#c4ff0d] text-black text-xs font-bold px-3 py-1 rounded">
                      LIVE
                    </span>
                  ) : auction.status === 'ended' || auction.status === 'completed' ? (
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded">
                      SOLD
                    </span>
                  ) : timeRemaining.ended ? (
                    <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded">
                      ENDED
                    </span>
                  ) : (
                    <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded">
                      {auction.status?.toUpperCase() || 'UNKNOWN'}
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
                    <p className="text-white font-semibold">{auction.totalBids || 0}</p>
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

                {/* Auction Status Warning */}
                {auction.status !== 'active' && (
                  <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-xl">
                    <p className="text-sm text-red-400 mb-2">
                      {auction.status === 'ended' || auction.status === 'completed' 
                        ? 'This auction has ended. The phone has been sold.' 
                        : `Auction is not active (Status: ${auction.status})`}
                    </p>
                    <button
                      onClick={loadPhoneDetails}
                      className="text-xs text-[#c4ff0d] hover:underline"
                    >
                      Refresh to check latest status
                    </button>
                  </div>
                )}

                {/* Bid Form - Show for active auctions */}
                {!timeRemaining.ended && auction.status === 'active' && (
                  <>
                    {isAuthenticated ? (
                      <form onSubmit={handlePlaceBid} className="space-y-4">
                        <div className="flex gap-3">
                          <div className="flex-1 relative">
                            <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">₹</span>
                            <input
                              type="number"
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                              placeholder={`Min: ₹${(Math.max(auction.currentBid || 0, phone.minBidPrice) + 1).toLocaleString()}`}
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
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl text-center">
                          <LogIn className="w-8 h-8 text-[#c4ff0d] mx-auto mb-3" />
                          <p className="text-white font-medium mb-2">Login to Place a Bid</p>
                          <p className="text-gray-400 text-sm mb-4">You need to be logged in to participate in this auction</p>
                          <button
                            onClick={() => navigate('/auth/signin')}
                            className="w-full py-3 bg-[#c4ff0d] text-black rounded-xl font-bold hover:bg-[#d4ff3d] transition flex items-center justify-center gap-2"
                          >
                            <LogIn className="w-5 h-5" />
                            Sign In to Bid
                          </button>
                          <p className="text-gray-500 text-xs mt-3">
                            Don't have an account?{' '}
                            <button 
                              onClick={() => navigate('/auth/signup')}
                              className="text-[#c4ff0d] hover:underline"
                            >
                              Sign up for free
                            </button>
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Bidding Section - Show when no auction exists */}
            {!auction && (
              <div className="bg-[#0f0f0f] border-2 border-[#c4ff0d] rounded-2xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">
                  {phone.status === 'pending' ? 'Auction Pending' : 'Place Your Bid'}
                </h2>
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-1">Starting Price:</p>
                  <p className="text-4xl font-bold text-[#c4ff0d]">
                    ₹{phone.minBidPrice?.toLocaleString()}
                  </p>
                </div>
                
                {phone.status === 'pending' ? (
                  <p className="text-gray-400 text-sm">
                    This phone is awaiting admin verification. Bidding will start once approved.
                  </p>
                ) : phone.status === 'live' ? (
                  <>
                    <p className="text-gray-400 text-sm mb-4">
                      Auction is being set up. Please refresh to check status.
                    </p>
                    <button
                      onClick={loadPhoneDetails}
                      className="w-full py-3 bg-[#c4ff0d] text-black rounded-xl font-bold hover:bg-[#d4ff3d] transition"
                    >
                      Refresh Auction Status
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-yellow-400 text-sm mb-2">Status: {phone.status}</p>
                    <p className="text-gray-400 text-sm mb-4">
                      Auction may not be available for this listing.
                    </p>
                    <button
                      onClick={loadPhoneDetails}
                      className="w-full py-3 bg-[#c4ff0d] text-black rounded-xl font-bold hover:bg-[#d4ff3d] transition"
                    >
                      Refresh
                    </button>
                  </>
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
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-white">Bid History</h3>
                {isOwner && bids.length > 0 && isAuctionActive && (
                  <span className="text-xs text-gray-400 bg-[#1a1a1a] px-3 py-1 rounded-full">
                    You can accept any bid
                  </span>
                )}
              </div>
              
              {bids.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">No bids yet. Be the first to bid!</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin scrollbar-track-[#1a1a1a] scrollbar-thumb-[#c4ff0d] scrollbar-thumb-rounded-full pr-2">
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
                        <div className="flex-1">
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
                        <div className="flex flex-col items-end gap-2">
                          <p className={`text-xl font-bold ${bid.isWinning ? 'text-[#c4ff0d]' : 'text-white'}`}>
                            ₹{bid.bidAmount.toLocaleString()}
                          </p>
                          {/* Accept Bid Button - Only visible to the seller/owner of the phone when auction is truly active */}
                          {isOwner && isAuctionActive && (
                            <button
                              onClick={() => openAcceptModal(bid)}
                              className="flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition"
                            >
                              <Gavel className="w-3 h-3" />
                              Accept
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Accept Bid Confirmation Modal */}
      {showAcceptModal && selectedBidToAccept && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-2xl w-full max-w-md p-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Accept This Bid?</h2>
              <p className="text-gray-400 text-sm">
                Are you sure you want to accept this bid? This action cannot be undone.
              </p>
            </div>

            <div className="bg-[#1a1a1a] rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Bidder:</span>
                <span className="text-white font-medium">{selectedBidToAccept.anonymousBidderId}</span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-400 text-sm">Bid Amount:</span>
                <span className="text-[#c4ff0d] font-bold text-lg">₹{selectedBidToAccept.bidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400 text-sm">Phone:</span>
                <span className="text-white">{phone?.brand} {phone?.model}</span>
              </div>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <p className="text-blue-400 text-sm">
                <strong>Note:</strong> Once accepted, confirmation emails will be sent to both you and the buyer with next steps for completing the transaction.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowAcceptModal(false);
                  setSelectedBidToAccept(null);
                }}
                disabled={acceptingBid}
                className="flex-1 py-3 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-xl font-semibold hover:bg-[#2a2a2a] transition disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAcceptBid}
                disabled={acceptingBid}
                className="flex-1 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {acceptingBid ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <Gavel className="w-4 h-4" />
                    Accept Bid
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default PhoneDetail;
