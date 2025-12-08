import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { reelAPI } from '../../services/reelService';
import { Play, Loader2, Trash2, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const UserReels = ({ userId, showDeleteButton = false }) => {
  const { user } = useAuth();
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedReel, setSelectedReel] = useState(null);
  const [deleting, setDeleting] = useState(null);

  const isOwner = user && userId === user._id;

  const fetchReels = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = userId 
        ? await reelAPI.getUserReels(userId, pageNum, 12)
        : await reelAPI.getMyReels(pageNum, 12);
      
      const newReels = response.data.data;
      
      if (pageNum === 1) {
        setReels(newReels);
      } else {
        setReels(prev => [...prev, ...newReels]);
      }
      
      setHasMore(response.data.pagination.page < response.data.pagination.pages);
      setError(null);
    } catch (err) {
      setError('Failed to load reels');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchReels(1);
  }, [fetchReels]);

  const loadMore = () => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchReels(nextPage);
    }
  };

  const handleDelete = async (reelId, e) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this reel?')) return;

    try {
      setDeleting(reelId);
      await reelAPI.deleteReel(reelId);
      setReels(prev => prev.filter(r => r._id !== reelId));
      toast.success('Reel deleted successfully');
    } catch (err) {
      toast.error('Failed to delete reel');
      console.error(err);
    } finally {
      setDeleting(null);
    }
  };

  if (loading && reels.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 text-[#c4ff0d] animate-spin" />
      </div>
    );
  }

  if (error && reels.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Play className="w-12 h-12 text-gray-600 mb-3" />
        <p className="text-gray-400">No reels yet</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-3 gap-1 sm:gap-2">
        {reels.map((reel) => {
          const isImageReel = reel.contentType === 'images' && reel.images?.length > 0;
          const thumbnailUrl = isImageReel ? reel.images[0]?.url : reel.thumbnailUrl;
          
          return (
            <div
              key={reel._id}
              className="relative aspect-[9/16] bg-[#1a1a1a] rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => setSelectedReel(reel)}
            >
              <img
                src={thumbnailUrl}
                alt="Reel thumbnail"
                className="w-full h-full object-cover"
                loading="lazy"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                {isImageReel ? (
                  <ImageIcon className="w-8 h-8 text-white" />
                ) : (
                  <Play className="w-8 h-8 text-white" fill="white" />
                )}
              </div>

              {/* Content type badge */}
              <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 rounded text-xs text-white flex items-center gap-1">
                {isImageReel ? (
                  <>
                    <ImageIcon className="w-3 h-3" />
                    {reel.images.length}
                  </>
                ) : (
                  <>{Math.round(reel.duration)}s</>
                )}
              </div>

              {/* Delete button */}
              {(showDeleteButton || isOwner) && (
                <button
                  onClick={(e) => handleDelete(reel._id, e)}
                  disabled={deleting === reel._id}
                  className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  {deleting === reel._id ? (
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4 text-white" />
                  )}
                </button>
              )}

              {/* Views */}
              <div className="absolute bottom-2 right-2 flex items-center gap-1 text-white text-xs">
                <Play className="w-3 h-3" />
                {reel.views || 0}
              </div>
            </div>
          );
        })}
      </div>

      {/* Load more button */}
      {hasMore && (
        <div className="flex justify-center mt-6">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-6 py-2 bg-[#1a1a1a] hover:bg-[#2a2a2a] text-white rounded-lg transition flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading...
              </>
            ) : (
              'Load More'
            )}
          </button>
        </div>
      )}

      {/* Video Modal */}
      {selectedReel && (
        <ReelModal reel={selectedReel} onClose={() => setSelectedReel(null)} />
      )}
    </>
  );
};

const ReelModal = ({ reel, onClose }) => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isImageReel = reel.contentType === 'images' && reel.images?.length > 0;

  const nextImage = () => {
    if (currentImageIndex < reel.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const prevImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  // Navigate to user's public profile
  const handleUserClick = () => {
    const anonymousId = reel.userId?.anonymousId;
    if (anonymousId) {
      onClose();
      navigate(`/user/${anonymousId}`);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-w-md w-full max-h-[90vh] bg-black rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white"
        >
          ✕
        </button>
        
        {isImageReel ? (
          <div className="relative">
            <img
              src={reel.images[currentImageIndex]?.url}
              alt={`Image ${currentImageIndex + 1}`}
              className="w-full max-h-[80vh] object-contain"
            />
            
            {/* Navigation arrows */}
            {reel.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  disabled={currentImageIndex === 0}
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={nextImage}
                  disabled={currentImageIndex === reel.images.length - 1}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5 text-white" />
                </button>
              </>
            )}

            {/* Image counter */}
            {reel.images.length > 1 && (
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/70 rounded-full text-white text-sm">
                {currentImageIndex + 1} / {reel.images.length}
              </div>
            )}
          </div>
        ) : (
          <video
            src={reel.videoUrl}
            className="w-full h-full max-h-[80vh] object-contain"
            controls
            autoPlay
            loop
          />
        )}

        <div className="p-4 bg-[#0f0f0f]">
          <button 
            onClick={handleUserClick}
            className="flex items-center gap-2 mb-2 hover:opacity-80 transition cursor-pointer"
          >
            {reel.userId?.avatar ? (
              <img 
                src={reel.userId.avatar} 
                alt={reel.userId?.name || 'User'} 
                className="w-8 h-8 rounded-full object-cover border-2 border-[#c4ff0d]"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#c4ff0d] flex items-center justify-center">
                <span className="text-black font-bold text-sm">
                  {reel.userId?.name?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <span className="text-white font-medium text-sm hover:underline">
              @{reel.userId?.anonymousId || 'Anonymous'}
            </span>
          </button>
          {reel.description && (
            <p className="text-gray-300 text-sm">{reel.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserReels;
