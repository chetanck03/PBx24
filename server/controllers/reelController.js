import Reel from '../models/Reel.js';
import { uploadVideo, deleteVideo, generateThumbnailUrl, uploadImage, deleteImage } from '../config/cloudinary.js';

// Upload a new reel (video)
export const uploadReel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: { message: 'No video file provided' }
      });
    }

    const { description } = req.body;
    let { duration } = req.body;

    // Parse duration if it's a string
    duration = parseFloat(duration);

    // Validate duration
    if (!duration || isNaN(duration)) {
      return res.status(400).json({
        success: false,
        error: { message: 'Video duration is required' }
      });
    }

    if (duration > 30) {
      return res.status(400).json({
        success: false,
        error: { message: 'Video duration cannot exceed 30 seconds' }
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadVideo(req.file.buffer, {
      resource_type: 'video',
      folder: 'reels'
    });

    // Generate thumbnail URL
    const thumbnailUrl = generateThumbnailUrl(uploadResult.secure_url);

    // Create reel in database
    const reel = new Reel({
      userId: req.user._id,
      contentType: 'video',
      videoUrl: uploadResult.secure_url,
      thumbnailUrl: thumbnailUrl,
      cloudinaryPublicId: uploadResult.public_id,
      duration: duration,
      description: description || ''
    });

    await reel.save();

    // Populate user info
    await reel.populate('userId', 'name anonymousId avatar');

    res.status(201).json({
      success: true,
      data: reel
    });
  } catch (error) {
    console.error('Error uploading reel:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to upload reel', details: error.message }
    });
  }
};

// Upload images as a reel (carousel post)
export const uploadImageReel = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'No images provided' }
      });
    }

    if (req.files.length > 10) {
      return res.status(400).json({
        success: false,
        error: { message: 'Maximum 10 images allowed per post' }
      });
    }

    const { description } = req.body;

    // Upload all images to Cloudinary
    const uploadPromises = req.files.map(file => 
      uploadImage(file.buffer, { folder: 'reels/images' })
    );

    const uploadResults = await Promise.all(uploadPromises);

    // Create images array
    const images = uploadResults.map(result => ({
      url: result.secure_url,
      publicId: result.public_id
    }));

    // Create reel in database
    const reel = new Reel({
      userId: req.user._id,
      contentType: 'images',
      images: images,
      description: description || ''
    });

    await reel.save();

    // Populate user info
    await reel.populate('userId', 'name anonymousId avatar');

    res.status(201).json({
      success: true,
      data: reel
    });
  } catch (error) {
    console.error('Error uploading image reel:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to upload images', details: error.message }
    });
  }
};

// Get all reels (sorted by latest first)
export const getAllReels = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reels = await Reel.find({ isActive: true })
      .populate('userId', 'name anonymousId avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Reel.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: reels,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching reels:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch reels' }
    });
  }
};

// Get reels by user ID
export const getUserReels = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reels = await Reel.find({ userId, isActive: true })
      .populate('userId', 'name anonymousId avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Reel.countDocuments({ userId, isActive: true });

    res.json({
      success: true,
      data: reels,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching user reels:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch user reels' }
    });
  }
};

// Get single reel by ID
export const getReelById = async (req, res) => {
  try {
    const { id } = req.params;

    const reel = await Reel.findById(id)
      .populate('userId', 'name anonymousId avatar');

    if (!reel) {
      return res.status(404).json({
        success: false,
        error: { message: 'Reel not found' }
      });
    }

    // Increment view count
    reel.views += 1;
    await reel.save();

    res.json({
      success: true,
      data: reel
    });
  } catch (error) {
    console.error('Error fetching reel:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch reel' }
    });
  }
};

// Increment view count for a reel (called when reel is actually watched)
export const incrementReelView = async (req, res) => {
  try {
    const { id } = req.params;

    const reel = await Reel.findById(id);

    if (!reel) {
      return res.status(404).json({
        success: false,
        error: { message: 'Reel not found' }
      });
    }

    // Increment view count
    reel.views = (reel.views || 0) + 1;
    await reel.save();

    res.json({
      success: true,
      data: { views: reel.views }
    });
  } catch (error) {
    console.error('Error incrementing view:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to increment view' }
    });
  }
};

// Delete a reel
export const deleteReel = async (req, res) => {
  try {
    const { id } = req.params;

    const reel = await Reel.findById(id);

    if (!reel) {
      return res.status(404).json({
        success: false,
        error: { message: 'Reel not found' }
      });
    }

    // Check ownership
    if (reel.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: { message: 'Not authorized to delete this reel' }
      });
    }

    // Delete from Cloudinary based on content type
    if (reel.contentType === 'video' && reel.cloudinaryPublicId) {
      await deleteVideo(reel.cloudinaryPublicId);
    } else if (reel.contentType === 'images' && reel.images?.length > 0) {
      // Delete all images
      const deletePromises = reel.images.map(img => deleteImage(img.publicId));
      await Promise.all(deletePromises);
    }

    // Delete from database
    await Reel.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Reel deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting reel:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete reel' }
    });
  }
};

// Get current user's reels
export const getMyReels = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reels = await Reel.find({ userId: req.user._id, isActive: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Reel.countDocuments({ userId: req.user._id, isActive: true });

    res.json({
      success: true,
      data: reels,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching my reels:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch your reels' }
    });
  }
};

// Like/Unlike a reel
export const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const reel = await Reel.findById(id);

    if (!reel) {
      return res.status(404).json({
        success: false,
        error: { message: 'Reel not found' }
      });
    }

    const likeIndex = reel.likes.indexOf(userId);
    let liked = false;

    if (likeIndex === -1) {
      // Add like
      reel.likes.push(userId);
      liked = true;
    } else {
      // Remove like
      reel.likes.splice(likeIndex, 1);
      liked = false;
    }

    await reel.save();

    res.json({
      success: true,
      data: {
        liked,
        likesCount: reel.likes.length
      }
    });
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to toggle like' }
    });
  }
};

// Add a comment to a reel
export const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'Comment text is required' }
      });
    }

    if (text.length > 300) {
      return res.status(400).json({
        success: false,
        error: { message: 'Comment cannot exceed 300 characters' }
      });
    }

    const reel = await Reel.findById(id);

    if (!reel) {
      return res.status(404).json({
        success: false,
        error: { message: 'Reel not found' }
      });
    }

    const newComment = {
      userId,
      text: text.trim(),
      createdAt: new Date()
    };

    reel.comments.push(newComment);
    await reel.save();

    // Get the saved comment with populated user
    const savedReel = await Reel.findById(id)
      .populate('comments.userId', 'name anonymousId avatar');

    const savedComment = savedReel.comments[savedReel.comments.length - 1];

    res.status(201).json({
      success: true,
      data: {
        comment: savedComment,
        commentsCount: reel.comments.length
      }
    });
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to add comment' }
    });
  }
};

// Get comments for a reel
export const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const reel = await Reel.findById(id)
      .populate('comments.userId', 'name anonymousId avatar');

    if (!reel) {
      return res.status(404).json({
        success: false,
        error: { message: 'Reel not found' }
      });
    }

    // Sort comments by newest first and paginate
    const sortedComments = reel.comments.sort((a, b) => b.createdAt - a.createdAt);
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedComments = sortedComments.slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      data: paginatedComments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: reel.comments.length,
        pages: Math.ceil(reel.comments.length / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch comments' }
    });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const userId = req.user._id;

    const reel = await Reel.findById(id);

    if (!reel) {
      return res.status(404).json({
        success: false,
        error: { message: 'Reel not found' }
      });
    }

    const comment = reel.comments.id(commentId);

    if (!comment) {
      return res.status(404).json({
        success: false,
        error: { message: 'Comment not found' }
      });
    }

    // Check if user owns the comment or is admin or owns the reel
    const isCommentOwner = comment.userId.toString() === userId.toString();
    const isReelOwner = reel.userId.toString() === userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isCommentOwner && !isReelOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        error: { message: 'Not authorized to delete this comment' }
      });
    }

    reel.comments.pull(commentId);
    await reel.save();

    res.json({
      success: true,
      message: 'Comment deleted successfully',
      data: { commentsCount: reel.comments.length }
    });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete comment' }
    });
  }
};

// Check if user has liked a reel
export const checkLikeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const reel = await Reel.findById(id);

    if (!reel) {
      return res.status(404).json({
        success: false,
        error: { message: 'Reel not found' }
      });
    }

    const liked = reel.likes.includes(userId);

    res.json({
      success: true,
      data: {
        liked,
        likesCount: reel.likes.length
      }
    });
  } catch (error) {
    console.error('Error checking like status:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to check like status' }
    });
  }
};

// Get user reel statistics (total views, likes, etc.)
// Supports both MongoDB ObjectId and anonymousId
export const getUserReelStats = async (req, res) => {
  try {
    const { userId } = req.params;
    
    let actualUserId = userId;
    
    // Check if userId is an anonymousId (starts with USER_)
    if (userId.startsWith('USER_') || userId.startsWith('SELLER_')) {
      const User = (await import('../models/User.js')).default;
      const user = await User.findOne({ anonymousId: userId });
      if (!user) {
        return res.json({
          success: true,
          data: {
            totalReels: 0,
            totalViews: 0,
            totalLikes: 0,
            totalComments: 0,
            reels: []
          }
        });
      }
      actualUserId = user._id;
    }

    const reels = await Reel.find({ userId: actualUserId, isActive: true });

    const stats = {
      totalReels: reels.length,
      totalViews: reels.reduce((sum, reel) => sum + (reel.views || 0), 0),
      totalLikes: reels.reduce((sum, reel) => sum + (reel.likes?.length || 0), 0),
      totalComments: reels.reduce((sum, reel) => sum + (reel.comments?.length || 0), 0),
      reels: reels.map(reel => ({
        _id: reel._id,
        contentType: reel.contentType || 'video',
        thumbnailUrl: reel.contentType === 'images' ? reel.images?.[0]?.url : reel.thumbnailUrl,
        videoUrl: reel.videoUrl,
        images: reel.images,
        views: reel.views || 0,
        likes: reel.likes?.length || 0,
        comments: reel.comments?.length || 0,
        createdAt: reel.createdAt
      }))
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching user reel stats:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch user reel statistics' }
    });
  }
};
