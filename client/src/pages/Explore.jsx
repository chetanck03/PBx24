import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { reelAPI, userAPI } from '../services/api';
import { Search, Play, User, X, Loader2, Image as ImageIcon } from 'lucide-react';


const Explore = () => {
  const navigate = useNavigate();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  useEffect(() => {
    loadReels();
  }, []);

  const loadReels = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setLoadingMore(true);
      
      const res = await reelAPI.getAllReels(pageNum, 12);
      const newReels = res.data.data || [];
      
      if (append) {
        setReels(prev => [...prev, ...newReels]);
      } else {
        setReels(newReels);
      }
      
      setHasMore(newReels.length === 12);
      setPage(pageNum);
    } catch (error) {
      console.error('Error loading reels:', error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      loadReels(page + 1, true);
    }
  };

  // Search for users by anonymous ID
  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      setShowSearchResults(false);
      return;
    }

    try {
      setSearching(true);
      setShowSearchResults(true);
      
      // Try to find user by anonymous ID
      const res = await userAPI.getPublicProfile(query.trim()).catch(() => null);
      
      if (res?.data?.data) {
        setSearchResults([res.data.data]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3) {
        handleSearch(searchQuery);
      } else {
        setSearchResults(null);
        setShowSearchResults(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery, handleSearch]);

  const handleUserClick = (anonymousId) => {
    setShowSearchResults(false);
    setSearchQuery('');
    navigate(`/user/${anonymousId}`);
  };

  const formatViews = (views) => {
    if (views >= 1000000) return `${(views / 1000000).toFixed(1)}M`;
    if (views >= 1000) return `${(views / 1000).toFixed(1)}K`;
    return views?.toString() || '0';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Search Bar */}
        <div className="relative mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search User ID (e.g., USER_ABC123)..."
              className="w-full pl-12 pr-12 py-4 bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-[#c4ff0d] transition text-base"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults(null);
                  setShowSearchResults(false);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-[#2a2a2a] rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {showSearchResults && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl overflow-hidden z-50 shadow-xl">
              {searching ? (
                <div className="p-4 flex items-center justify-center gap-2 text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Searching...</span>
                </div>
              ) : searchResults?.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  <User className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No user found with ID "{searchQuery}"</p>
                  <p className="text-xs mt-1">Try searching with full User ID</p>
                </div>
              ) : searchResults?.map((user) => (
                <button
                  key={user.anonymousId}
                  onClick={() => handleUserClick(user.anonymousId)}
                  className="w-full flex items-center gap-3 p-4 hover:bg-[#2a2a2a] transition text-left"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#c4ff0d] to-[#8bc34a] flex items-center justify-center">
                      <span className="text-black font-bold text-lg">
                        {user.name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-semibold truncate">{user.name}</p>
                    <p className="text-[#c4ff0d] text-sm">@{user.anonymousId}</p>
                    <p className="text-gray-500 text-xs">
                      {user.stats?.activeListings || 0} listings • {user.stats?.totalBids || 0} bids
                    </p>
                  </div>
                  <div className="text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Explore</h1>
          <p className="text-gray-500 text-sm">Discover reels from the community</p>
        </div>

        {/* Reels Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-[#c4ff0d] animate-spin" />
          </div>
        ) : reels.length === 0 ? (
          <div className="text-center py-20">
            <Play className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No reels yet</p>
            <p className="text-gray-600 text-sm mt-1">Be the first to upload a reel!</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-3 gap-1 sm:gap-2">
              {reels.map((reel) => {
                const isImageReel = reel.contentType === 'images' && reel.images?.length > 0;
                const thumbnailUrl = isImageReel ? reel.images[0]?.url : reel.thumbnailUrl;
                
                return (
                  <div
                    key={reel._id}
                    onClick={() => navigate('/reels')}
                    className="relative aspect-[9/16] bg-[#1a1a1a] rounded-lg overflow-hidden cursor-pointer group"
                  >
                    {/* Thumbnail */}
                    {thumbnailUrl ? (
                      <img
                        src={thumbnailUrl}
                        alt="Reel"
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f]">
                        {isImageReel ? (
                          <ImageIcon className="w-10 h-10 text-gray-600" />
                        ) : (
                          <Play className="w-10 h-10 text-gray-600" />
                        )}
                      </div>
                    )}

                    {/* Hover Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {isImageReel ? (
                        <ImageIcon className="w-12 h-12 text-white" />
                      ) : (
                        <Play className="w-12 h-12 text-white" fill="white" />
                      )}
                    </div>

                    {/* Content Type Badge */}
                    {isImageReel && reel.images.length > 1 && (
                      <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/70 rounded text-white text-xs flex items-center gap-1">
                        <ImageIcon className="w-3 h-3" />
                        {reel.images.length}
                      </div>
                    )}

                    {/* Views Count */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 text-white text-xs font-medium">
                      <Play className="w-3 h-3" fill="white" />
                      <span>{formatViews(reel.views)}</span>
                    </div>

                    {/* User Info on Hover */}
                    <div className="absolute top-2 left-2 right-10 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/user/${reel.userId?.anonymousId}`);
                        }}
                        className="flex items-center gap-2 bg-black/60 backdrop-blur-sm rounded-full px-2 py-1"
                      >
                        {reel.userId?.avatar ? (
                          <img
                            src={reel.userId.avatar}
                            alt=""
                            className="w-5 h-5 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-[#c4ff0d] flex items-center justify-center">
                            <span className="text-black text-xs font-bold">
                              {reel.userId?.name?.charAt(0) || 'U'}
                            </span>
                          </div>
                        )}
                        <span className="text-white text-xs truncate max-w-[80px]">
                          @{reel.userId?.anonymousId?.substring(0, 10)}...
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-8 text-center">
                <button
                  onClick={loadMore}
                  disabled={loadingMore}
                  className="px-8 py-3 bg-[#1a1a1a] border border-[#2a2a2a] text-white rounded-xl font-medium hover:bg-[#2a2a2a] transition disabled:opacity-50"
                >
                  {loadingMore ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading...
                    </span>
                  ) : (
                    'Load More'
                  )}
                </button>
              </div>
            )}
          </>
        )}
      </div>

    </div>
  );
};

export default Explore;
