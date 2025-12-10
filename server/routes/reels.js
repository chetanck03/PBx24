import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import { uploadVideo, uploadImages, handleMulterError } from '../middleware/uploadMiddleware.js';
import {
  uploadReel,
  uploadImageReel,
  getAllReels,
  getUserReels,
  getReelById,
  deleteReel,
  getMyReels,
  toggleLike,
  addComment,
  getComments,
  deleteComment,
  checkLikeStatus,
  getUserReelStats,
  incrementReelView
} from '../controllers/reelController.js';

const router = express.Router();

// Optional auth middleware - attaches user if token exists, but doesn't require it
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const jwt = require('jsonwebtoken');
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { _id: decoded.userId };
    } catch (err) {
      // Token invalid, continue without user
    }
  }
  next();
};

// Public routes
router.get('/all', getAllReels);
router.get('/user/:userId', getUserReels);
router.get('/user/:userId/stats', getUserReelStats);
router.post('/:id/view', optionalAuth, incrementReelView);  // Track unique view per user
router.get('/:id', getReelById);
router.get('/:id/comments', getComments);

// Protected routes - Video upload
router.post(
  '/upload',
  authenticateToken,
  uploadVideo.single('video'),
  handleMulterError,
  uploadReel
);

// Protected routes - Image upload (carousel)
router.post(
  '/upload/images',
  authenticateToken,
  uploadImages.array('images', 10),
  handleMulterError,
  uploadImageReel
);

router.get('/my/reels', authenticateToken, getMyReels);
router.delete('/:id', authenticateToken, deleteReel);

// Like routes
router.post('/:id/like', authenticateToken, toggleLike);
router.get('/:id/like/status', authenticateToken, checkLikeStatus);

// Comment routes
router.post('/:id/comments', authenticateToken, addComment);
router.delete('/:id/comments/:commentId', authenticateToken, deleteComment);

export default router;
