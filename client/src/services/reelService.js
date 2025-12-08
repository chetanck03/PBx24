import api from './api';

export const reelAPI = {
  // Upload a new video reel
  uploadReel: (formData, onUploadProgress) => {
    return api.post('/reels/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },

  // Upload images as a reel (carousel)
  uploadImageReel: (formData, onUploadProgress) => {
    return api.post('/reels/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },

  // Get all reels (paginated)
  getAllReels: (page = 1, limit = 10) => {
    return api.get('/reels/all', { params: { page, limit } });
  },

  // Get reels by user ID
  getUserReels: (userId, page = 1, limit = 12) => {
    return api.get(`/reels/user/${userId}`, { params: { page, limit } });
  },

  // Get current user's reels
  getMyReels: (page = 1, limit = 12) => {
    return api.get('/reels/my/reels', { params: { page, limit } });
  },

  // Get single reel by ID
  getReelById: (id) => {
    return api.get(`/reels/${id}`);
  },

  // Increment view count when reel is watched
  incrementView: (id) => {
    return api.post(`/reels/${id}/view`);
  },

  // Delete a reel
  deleteReel: (id) => {
    return api.delete(`/reels/${id}`);
  },

  // Like/Unlike a reel
  toggleLike: (id) => {
    return api.post(`/reels/${id}/like`);
  },

  // Check like status
  checkLikeStatus: (id) => {
    return api.get(`/reels/${id}/like/status`);
  },

  // Get comments for a reel
  getComments: (id, page = 1, limit = 20) => {
    return api.get(`/reels/${id}/comments`, { params: { page, limit } });
  },

  // Add a comment
  addComment: (id, text) => {
    return api.post(`/reels/${id}/comments`, { text });
  },

  // Delete a comment
  deleteComment: (reelId, commentId) => {
    return api.delete(`/reels/${reelId}/comments/${commentId}`);
  }
};

export default reelAPI;
