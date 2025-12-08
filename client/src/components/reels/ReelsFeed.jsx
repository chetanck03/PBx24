import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { reelAPI } from '../../services/reelService';
import { useAuth } from '../../context/AuthContext';
import { Play, Pause, Volume2, VolumeX, Heart, MessageCircle, Share2, Loader2, X, Send, Trash2, Eye, ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const ReelsFeed = () => {
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const containerRef = useRef(null);

  const fetchReels = useCallback(async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await reelAPI.getAllReels(pageNum, 10);
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
  }, []);

  useEffect(() => {
    fetchReels(1);
  }, [fetchReels]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchReels(nextPage);
    }
  }, [loading, hasMore, page, fetchReels]);

  const handleScroll = useCallback((e) => {
    const container = e.target;
    const scrollTop = container.scrollTop;
    const itemHeight = container.clientHeight;
    const newIndex = Math.round(scrollTop / itemHeight);
    
    if (newIndex !== currentIndex && newIndex < reels.length) {
      setCurrentIndex(newIndex);
    }

    if (scrollTop + itemHeight >= container.scrollHeight - itemHeight * 2) {
      loadMore();
    }
  }, [currentIndex, reels.length, loadMore]);

  const updateReelData = (reelId, updates) => {
    setReels(prev => prev.map(r => r._id === reelId ? { ...r, ...updates } : r));
  };

  if (loading && reels.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <Loader2 className="w-8 h-8 text-[#c4ff0d] animate-spin" />
      </div>
    );
  }

  if (error && reels.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-black">
        <Play className="w-16 h-16 text-gray-600 mb-4" />
        <p className="text-gray-400 text-lg">No reels yet</p>
        <p className="text-gray-500 text-sm">Be the first to upload a reel!</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="h-screen overflow-y-scroll snap-y snap-mandatory bg-black scrollbar-hide"
      onScroll={handleScroll}
      style={{ scrollSnapType: 'y mandatory' }}
    >
      {reels.map((reel, index) => (
        <ReelItem 
          key={reel._id} 
          reel={reel} 
          isActive={index === currentIndex}
          onUpdate={(updates) => updateReelData(reel._id, updates)}
        />
      ))}
      {loading && (
        <div className="h-20 flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-[#c4ff0d] animate-spin" />
        </div>
      )}
    </div>
  );
};

// Track viewed reels in session to prevent duplicate views
const viewedReelsInSession = new Set();

const ReelItem = ({ reel, isActive, onUpdate }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(reel.likes?.length || 0);
  const [commentsCount, setCommentsCount] = useState(reel.comments?.length || 0);
  const [showComments, setShowComments] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [viewCount, setViewCount] = useState(reel.views || 0);
  const viewTrackedRef = useRef(false);
  
  // For image carousel
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const isImageReel = reel.contentType === 'images' && reel.images?.length > 0;

  // Navigate to user's public profile
  const handleUserClick = (e) => {
    e.stopPropagation();
    const anonymousId = reel.userId?.anonymousId;
    if (anonymousId) {
      navigate(`/user/${anonymousId}`);
    }
  };

  useEffect(() => {
    // Check if user has liked this reel
    if (isAuthenticated && user && reel.likes) {
      setLiked(reel.likes.includes(user._id));
    }
  }, [isAuthenticated, user, reel.likes]);

  // Track view when reel becomes active - only once per session per reel
  useEffect(() => {
    if (isActive && !viewTrackedRef.current && !viewedReelsInSession.has(reel._id)) {
      viewTrackedRef.current = true;
      viewedReelsInSession.add(reel._id);
      
      // Increment view count in database
      reelAPI.incrementView(reel._id)
        .then(response => {
          if (response.data.data?.views) {
            setViewCount(response.data.data.views);
            onUpdate({ views: response.data.data.views });
          }
        })
        .catch(err => console.error('Error tracking view:', err));
    }
  }, [isActive, reel._id, onUpdate]);

  useEffect(() => {
    if (isImageReel) return; // Skip video logic for image reels
    
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      video.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive, isImageReel]);

  const togglePlay = () => {
    if (isImageReel) return; // No play/pause for images
    
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (isImageReel) return;
    
    const video = videoRef.current;
    if (!video) return;
    video.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  // Image carousel navigation
  const nextImage = (e) => {
    e.stopPropagation();
    if (currentImageIndex < reel.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
    }
  };

  const prevImage = (e) => {
    e.stopPropagation();
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
    }
  };

  const handleLike = async (e) => {
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to like reels');
      return;
    }

    try {
      setLikeLoading(true);
      const response = await reelAPI.toggleLike(reel._id);
      setLiked(response.data.data.liked);
      setLikesCount(response.data.data.likesCount);
      onUpdate({ likes: response.data.data.liked ? [...(reel.likes || []), user._id] : (reel.likes || []).filter(id => id !== user._id) });
    } catch (err) {
      toast.error('Failed to like reel');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleShare = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(window.location.origin + '/reels?id=' + reel._id);
      toast.success('Link copied to clipboard!');
    } catch {
      toast.error('Failed to copy link');
    }
  };

  return (
    <div 
      className="h-screen w-full snap-start relative flex items-center justify-center bg-black"
      onClick={togglePlay}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      {isImageReel ? (
        /* Image Carousel */
        <>
          <img
            src={reel.images[currentImageIndex]?.url}
            alt={`Image ${currentImageIndex + 1}`}
            className="h-full w-full object-contain max-w-md mx-auto"
          />
          
          {/* Image navigation arrows */}
          {reel.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                disabled={currentImageIndex === 0}
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="w-6 h-6 text-white" />
              </button>
              <button
                onClick={nextImage}
                disabled={currentImageIndex === reel.images.length - 1}
                className="absolute right-16 top-1/2 -translate-y-1/2 p-2 bg-black/50 hover:bg-black/70 rounded-full disabled:opacity-30 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="w-6 h-6 text-white" />
              </button>
            </>
          )}

          {/* Image indicator dots */}
          {reel.images.length > 1 && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {reel.images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                  className={`w-2 h-2 rounded-full transition ${
                    index === currentImageIndex ? 'bg-white' : 'bg-white/40'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Image counter badge */}
          <div className="absolute top-4 right-4 px-3 py-1 bg-black/50 rounded-full flex items-center gap-1.5">
            <ImageIcon className="w-4 h-4 text-white" />
            <span className="text-white text-sm">{currentImageIndex + 1}/{reel.images.length}</span>
          </div>
        </>
      ) : (
        /* Video Player */
        <>
          <video
            ref={videoRef}
            src={reel.videoUrl}
            className="h-full w-full object-contain max-w-md mx-auto"
            loop
            muted={isMuted}
            playsInline
            preload="metadata"
            poster={reel.thumbnailUrl}
          />

          {/* Play/Pause overlay */}
          {showControls && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 transition-opacity">
              <button className="p-4 rounded-full bg-black/50">
                {isPlaying ? (
                  <Pause className="w-12 h-12 text-white" />
                ) : (
                  <Play className="w-12 h-12 text-white" />
                )}
              </button>
            </div>
          )}

          {/* Mute button */}
          <button
            onClick={toggleMute}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/50 hover:bg-black/70 transition"
          >
            {isMuted ? (
              <VolumeX className="w-5 h-5 text-white" />
            ) : (
              <Volume2 className="w-5 h-5 text-white" />
            )}
          </button>
        </>
      )}

      {/* Right side actions */}
      <div className="absolute right-4 bottom-24 flex flex-col gap-4">
        {/* Like button */}
        <button 
          onClick={handleLike}
          disabled={likeLoading}
          className="flex flex-col items-center gap-1 text-white"
        >
          <div className={`p-3 rounded-full transition ${liked ? 'bg-red-500' : 'bg-black/50 hover:bg-black/70'}`}>
            <Heart className={`w-6 h-6 ${liked ? 'fill-white' : ''}`} />
          </div>
          <span className="text-xs font-medium">{likesCount}</span>
        </button>

        {/* Comment button */}
        <button 
          onClick={(e) => { e.stopPropagation(); setShowComments(true); }}
          className="flex flex-col items-center gap-1 text-white"
        >
          <div className="p-3 rounded-full bg-black/50 hover:bg-black/70 transition">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium">{commentsCount}</span>
        </button>

        {/* Share button */}
        <button 
          onClick={handleShare}
          className="flex flex-col items-center gap-1 text-white"
        >
          <div className="p-3 rounded-full bg-black/50 hover:bg-black/70 transition">
            <Share2 className="w-6 h-6" />
          </div>
        </button>

        {/* View count */}
        <div className="flex flex-col items-center gap-1 text-white">
          <div className="p-3 rounded-full bg-black/50">
            <Eye className="w-6 h-6" />
          </div>
          <span className="text-xs font-medium">{viewCount}</span>
        </div>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-4 left-4 right-20 text-white">
        <button 
          onClick={handleUserClick}
          className="flex items-center gap-2 mb-2 hover:opacity-80 transition cursor-pointer"
        >
          {reel.userId?.avatar ? (
            <img 
              src={reel.userId.avatar} 
              alt={reel.userId?.name || 'User'} 
              className="w-10 h-10 rounded-full object-cover border-2 border-[#c4ff0d]"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-[#c4ff0d] flex items-center justify-center">
              <span className="text-black font-bold">
                {reel.userId?.name?.charAt(0) || 'U'}
              </span>
            </div>
          )}
          <span className="font-semibold hover:underline">
            @{reel.userId?.anonymousId || 'Anonymous'}
          </span>
        </button>
        {reel.description && (
          <p className="text-sm text-gray-200 line-clamp-2">{reel.description}</p>
        )}
      </div>

      {/* Comments Modal */}
      {showComments && (
        <CommentsModal 
          reel={reel} 
          onClose={() => setShowComments(false)}
          onCommentsUpdate={(count) => setCommentsCount(count)}
        />
      )}
    </div>
  );
};

const CommentsModal = ({ reel, onClose, onCommentsUpdate }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Navigate to user's public profile
  const handleCommentUserClick = (anonymousId) => {
    if (anonymousId) {
      onClose();
      navigate(`/user/${anonymousId}`);
    }
  };

  useEffect(() => {
    fetchComments(1);
  }, [reel._id]);

  const fetchComments = async (pageNum) => {
    try {
      setLoading(true);
      const response = await reelAPI.getComments(reel._id, pageNum, 20);
      if (pageNum === 1) {
        setComments(response.data.data);
      } else {
        setComments(prev => [...prev, ...response.data.data]);
      }
      setHasMore(response.data.pagination.page < response.data.pagination.pages);
    } catch (err) {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    try {
      setSubmitting(true);
      const response = await reelAPI.addComment(reel._id, newComment.trim());
      setComments(prev => [response.data.data.comment, ...prev]);
      setNewComment('');
      onCommentsUpdate(response.data.data.commentsCount);
      toast.success('Comment added!');
    } catch (err) {
      toast.error('Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    try {
      const response = await reelAPI.deleteComment(reel._id, commentId);
      setComments(prev => prev.filter(c => c._id !== commentId));
      onCommentsUpdate(response.data.data.commentsCount);
      toast.success('Comment deleted');
    } catch (err) {
      toast.error('Failed to delete comment');
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - new Date(date);
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/80 flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <div 
        className="bg-[#0f0f0f] w-full max-w-lg h-[70vh] sm:h-[80vh] rounded-t-2xl sm:rounded-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#2a2a2a]">
          <h3 className="text-white font-semibold text-lg">Comments ({comments.length})</h3>
          <button onClick={onClose} className="p-2 hover:bg-[#1a1a1a] rounded-full">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-[#1a1a1a] scrollbar-thumb-[#c4ff0d] scrollbar-thumb-rounded-full p-4 space-y-4">
          {loading && comments.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 text-[#c4ff0d] animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-400">No comments yet</p>
              <p className="text-gray-500 text-sm">Be the first to comment!</p>
            </div>
          ) : (
            <>
              {comments.map((comment) => (
                <div key={comment._id} className="flex gap-3">
                  <button 
                    onClick={() => handleCommentUserClick(comment.userId?.anonymousId)}
                    className="w-9 h-9 rounded-full bg-[#c4ff0d] flex items-center justify-center flex-shrink-0 hover:opacity-80 transition cursor-pointer"
                  >
                    <span className="text-black font-bold text-sm">
                      {comment.userId?.name?.charAt(0) || 'U'}
                    </span>
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <button 
                        onClick={() => handleCommentUserClick(comment.userId?.anonymousId)}
                        className="text-white font-medium text-sm hover:underline cursor-pointer"
                      >
                        @{comment.userId?.anonymousId || 'Anonymous'}
                      </button>
                      <span className="text-gray-500 text-xs">
                        {formatTime(comment.createdAt)}
                      </span>
                    </div>
                    <p className="text-gray-300 text-sm break-words">{comment.text}</p>
                  </div>
                  {isAuthenticated && (comment.userId?._id === user?._id || reel.userId?._id === user?._id) && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="p-1 hover:bg-red-500/20 rounded text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              {hasMore && (
                <button
                  onClick={() => { setPage(p => p + 1); fetchComments(page + 1); }}
                  className="w-full py-2 text-[#c4ff0d] text-sm hover:underline"
                >
                  Load more comments
                </button>
              )}
            </>
          )}
        </div>

        {/* Comment Input */}
        {isAuthenticated ? (
          <form onSubmit={handleSubmit} className="p-4 border-t border-[#2a2a2a]">
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-full bg-[#c4ff0d] flex items-center justify-center flex-shrink-0">
                <span className="text-black font-bold text-sm">
                  {user?.name?.charAt(0) || 'U'}
                </span>
              </div>
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  maxLength={300}
                  className="flex-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-full px-4 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-[#c4ff0d]"
                />
                <button
                  type="submit"
                  disabled={!newComment.trim() || submitting}
                  className="p-2 bg-[#c4ff0d] rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <Loader2 className="w-5 h-5 text-black animate-spin" />
                  ) : (
                    <Send className="w-5 h-5 text-black" />
                  )}
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="p-4 border-t border-[#2a2a2a] text-center">
            <p className="text-gray-400 text-sm">Please login to comment</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReelsFeed;
