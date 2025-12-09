import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI, reelAPI } from '../services/api';
import { ArrowLeft, MoreHorizontal, Gavel, Trophy, Play, CheckCircle, Smartphone, RefreshCw, Image as ImageIcon } from 'lucide-react';


const PublicProfile = () => {
  const { anonymousId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('listings');
  const [error, setError] = useState(null);

  // Load profile on mount and when anonymousId changes
  useEffect(() => {
    loadProfile();
  }, [anonymousId]);

  // Auto-refresh every 60 seconds for real-time data
  useEffect(() => {
    if (!profile) return;
    
    const interval = setInterval(() => {
      refreshProfile();
    }, 60000);
    
    return () => clearInterval(interval);
  }, [profile, anonymousId]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [profileRes, reelsRes] = await Promise.all([
        userAPI.getPublicProfile(anonymousId),
        reelAPI.getUserReelStats(anonymousId).catch(() => ({ data: { data: { reels: [] } } }))
      ]);
      
      setProfile(profileRes.data.data);
      setReels(reelsRes.data.data?.reels || []);
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('User not found');
    } finally {
      setLoading(false);
    }
  };

  // Silent refresh without loading state
  const refreshProfile = useCallback(async () => {
    if (refreshing) return;
    try {
      setRefreshing(true);
      const [profileRes, reelsRes] = await Promise.all([
        userAPI.getPublicProfile(anonymousId),
        reelAPI.getUserReelStats(anonymousId).catch(() => ({ data: { data: { reels: [] } } }))
      ]);
      
      setProfile(profileRes.data.data);
      setReels(reelsRes.data.data?.reels || []);
    } catch (err) {
      console.error('Error refreshing profile:', err);
    } finally {
      setRefreshing(false);
    }
  }, [anonymousId, refreshing]);

  const getTimeRemaining = (endTime) => {
    if (!endTime) return 'N/A';
    const now = new Date();
    const end = new Date(endTime);
    const diff = end - now;
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#c4ff0d]"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a]">
        <p className="text-gray-400 text-lg mb-4">{error || 'User not found'}</p>
        <button
          onClick={() => navigate(-1)}
          className="text-[#c4ff0d] hover:underline"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0a0a0a] border-b border-[#1a1a1a] px-4 py-3">
          <div className="flex items-center justify-between">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-[#1a1a1a] rounded-full">
              <ArrowLeft className="w-6 h-6 text-white" />
            </button>
            <h1 className="text-white font-semibold">@{profile.anonymousId}</h1>
            <button 
              onClick={refreshProfile}
              disabled={refreshing}
              className="p-2 -mr-2 hover:bg-[#1a1a1a] rounded-full disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 text-gray-400 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Profile Info */}
        <div className="px-4 py-6">
          <div className="flex items-start gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-20 h-20 rounded-full object-cover border-2 border-[#2a2a2a]"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#c4ff0d] to-[#8bc34a] flex items-center justify-center">
                  <span className="text-black font-bold text-2xl">
                    {profile.name?.charAt(0) || 'U'}
                  </span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="flex-1 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xl font-bold text-white">{profile.stats.activeListings}</p>
                <p className="text-xs text-gray-400">Active Listings</p>
              </div>
              <div className="border-l border-r border-[#2a2a2a]">
                <p className="text-xl font-bold text-white">{profile.stats.totalBids}</p>
                <p className="text-xs text-gray-400">Total Bids</p>
              </div>
              <div>
                <p className="text-xl font-bold text-white">{profile.stats.wonAuctions}</p>
                <p className="text-xs text-gray-400">Won Auctions</p>
              </div>
            </div>
          </div>

          {/* Name & Bio */}
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <h2 className="text-white font-semibold text-lg">{profile.name}</h2>
              {profile.isVerified && (
                <CheckCircle className="w-5 h-5 text-[#c4ff0d]" />
              )}
            </div>
            <p className="text-gray-400 text-sm">@{profile.anonymousId}</p>
            <p className="text-gray-500 text-xs mt-1">
              Member since {new Date(profile.memberSince).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-4">
            <button className="flex-1 bg-[#c4ff0d] text-black py-2.5 rounded-lg font-semibold hover:bg-[#d4ff3d] transition">
              Follow
            </button>
            <button className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] text-white py-2.5 rounded-lg font-semibold hover:bg-[#2a2a2a] transition">
              Message
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-[#1a1a1a]">
          <div className="flex">
            <button
              onClick={() => setActiveTab('listings')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition ${
                activeTab === 'listings' 
                  ? 'border-[#c4ff0d] text-[#c4ff0d]' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Gavel className="w-5 h-5" />
              <span className="text-sm font-medium">Listings</span>
            </button>
            <button
              onClick={() => setActiveTab('won')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition ${
                activeTab === 'won' 
                  ? 'border-[#c4ff0d] text-[#c4ff0d]' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Trophy className="w-5 h-5" />
              <span className="text-sm font-medium">Won ({profile.stats.wonAuctions})</span>
            </button>
            <button
              onClick={() => setActiveTab('reels')}
              className={`flex-1 py-3 flex items-center justify-center gap-2 border-b-2 transition ${
                activeTab === 'reels' 
                  ? 'border-[#c4ff0d] text-[#c4ff0d]' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Play className="w-5 h-5" />
              <span className="text-sm font-medium">Reels</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {activeTab === 'listings' && (
            <div>
              {profile.listings.length === 0 ? (
                <div className="text-center py-12">
                  <Smartphone className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">No active listings</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {profile.listings.map((listing) => (
                    <div
                      key={listing._id}
                      onClick={() => navigate(`/phone/${listing._id}`)}
                      className="bg-[#0f0f0f] border border-[#1a1a1a] rounded-xl overflow-hidden cursor-pointer hover:border-[#c4ff0d] transition group"
                    >
                      {/* Image */}
                      <div className="relative aspect-square bg-[#1a1a1a]">
                        {listing.images?.[0] ? (
                          <img
                            src={listing.images[0]}
                            alt={`${listing.brand} ${listing.model}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Smartphone className="w-12 h-12 text-gray-600" />
                          </div>
                        )}
                        {/* Condition Badge */}
                        <div className="absolute top-2 right-2">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                            listing.condition === 'Excellent' ? 'bg-green-500 text-white' :
                            listing.condition === 'Good' ? 'bg-[#c4ff0d] text-black' :
                            'bg-yellow-500 text-black'
                          }`}>
                            {listing.condition}
                          </span>
                        </div>
                      </div>
                      
                      {/* Info */}
                      <div className="p-3">
                        <p className="text-[#c4ff0d] font-bold">
                          ₹{(listing.currentBid || listing.minBidPrice).toLocaleString()}
                          <span className="text-gray-500 text-xs font-normal ml-1">
                            ({listing.totalBids} bids)
                          </span>
                        </p>
                        <p className="text-gray-400 text-xs mt-1">
                          Ends in {getTimeRemaining(listing.auctionEndTime)}
                        </p>
                        <p className="text-white text-sm font-medium mt-1 truncate">
                          {listing.brand} {listing.model}
                        </p>
                        <p className="text-gray-500 text-xs">{listing.storage}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'won' && (
            <div className="text-center py-12">
              <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">Won auctions are private</p>
              <p className="text-gray-600 text-sm mt-1">
                {profile.stats.wonAuctions} auctions won
              </p>
            </div>
          )}

          {activeTab === 'reels' && (
            <div>
              {reels.length === 0 ? (
                <div className="text-center py-12">
                  <Play className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">No reels yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-1">
                  {reels.map((reel) => {
                    const isImageReel = reel.contentType === 'images' && reel.images?.length > 0;
                    const thumbnailUrl = isImageReel ? reel.images[0]?.url : reel.thumbnailUrl;
                    
                    return (
                      <div
                        key={reel._id}
                        onClick={() => navigate('/reels')}
                        className="relative aspect-[9/16] bg-[#1a1a1a] rounded-lg overflow-hidden cursor-pointer group"
                      >
                        {thumbnailUrl ? (
                          <img
                            src={thumbnailUrl}
                            alt="Reel"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            {isImageReel ? (
                              <ImageIcon className="w-8 h-8 text-gray-600" />
                            ) : (
                              <Play className="w-8 h-8 text-gray-600" />
                            )}
                          </div>
                        )}
                        {/* Content type badge */}
                        {isImageReel && reel.images?.length > 1 && (
                          <div className="absolute top-2 right-2 px-1.5 py-0.5 bg-black/70 rounded text-white text-xs flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            {reel.images.length}
                          </div>
                        )}
                        {/* Play/Image overlay */}
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                          {isImageReel ? (
                            <ImageIcon className="w-10 h-10 text-white" />
                          ) : (
                            <Play className="w-10 h-10 text-white" fill="white" />
                          )}
                        </div>
                        {/* Views */}
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs">
                          <Play className="w-3 h-3" fill="white" />
                          <span>{reel.views || 0}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default PublicProfile;
