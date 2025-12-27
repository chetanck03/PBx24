import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance with optimized settings
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 30000 // Increased timeout for slower connections
});

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000;

// Helper function to check if error is retryable
const isRetryableError = (error) => {
  return (
    !error.response || // Network error
    error.code === 'ECONNABORTED' || // Timeout
    error.response?.status >= 500 // Server error
  );
};

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Add retry count to config
    config.retryCount = config.retryCount || 0;
    
    // Add timestamp to auction/bid requests to prevent browser caching
    if (config.url?.includes('/auctions') || config.url?.includes('/bids')) {
      const separator = config.url.includes('?') ? '&' : '?';
      config.url = `${config.url}${separator}_t=${Date.now()}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors with retry logic
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Only redirect if not already on auth pages
      if (!window.location.pathname.includes('/auth/')) {
        window.location.href = '/auth/signin';
      }
      return Promise.reject(error);
    }
    
    // Retry logic for retryable errors
    if (isRetryableError(error) && config.retryCount < MAX_RETRIES) {
      config.retryCount += 1;
      console.log(`Retrying request (${config.retryCount}/${MAX_RETRIES}):`, config.url);
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * config.retryCount));
      
      return api(config);
    }
    
    // Log error for debugging (only in development)
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        url: config?.url,
        method: config?.method,
        status: error.response?.status,
        message: error.message
      });
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  googleLogin: (googleData) => api.post('/auth/google', googleData),
  googleRegister: (googleData) => api.post('/auth/google/register', googleData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/me')
};

// User API
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updateWallet: (amount, operation) => api.post('/users/wallet', { amount, operation }),
  submitKYC: (kycData) => api.post('/users/kyc', { kycData }),
  getUserByAnonymousId: (anonymousId) => api.get(`/users/anonymous/${anonymousId}`),
  getPublicProfile: (anonymousId) => api.get(`/users/public/${anonymousId}`)
};

// Phone API
export const phoneAPI = {
  getAllPhones: (params) => api.get('/phones', { params }),
  getMarketplace: (params) => api.get('/phones/marketplace', { params }), // Optimized: phones + auctions in single call
  getPhoneById: (id) => api.get(`/phones/${id}`),
  getSellerPhones: () => api.get('/phones/seller/my-phones'),
  getSoldPhones: () => api.get('/phones/seller/sold'),
  getPurchasedPhones: () => api.get('/phones/user/purchased'),
  createPhone: (data) => api.post('/phones', data),
  updatePhone: (id, data) => api.put(`/phones/${id}`, data),
  deletePhone: (id) => api.delete(`/phones/${id}`)
};

// Auction API
export const auctionAPI = {
  getActiveAuctions: () => api.get('/auctions'),
  getAuctionById: (id) => api.get(`/auctions/${id}`),
  getAuctionByPhoneId: (phoneId) => api.get(`/auctions/phone/${phoneId}`),
  createAuction: (data) => api.post('/auctions', data),
  endAuction: (id) => api.put(`/auctions/${id}/end`),
  cancelAuction: (id) => api.put(`/auctions/${id}/cancel`)
};

// Bid API
export const bidAPI = {
  placeBid: (auctionId, bidAmount) => api.post('/bids', { auctionId, bidAmount }),
  getAuctionBids: (auctionId) => api.get(`/bids/auction/${auctionId}`),
  getUserBids: () => api.get('/bids/my-bids'),
  getSellerAuctionBids: (auctionId) => api.get(`/bids/seller/auction/${auctionId}`),
  acceptBid: (bidId) => api.post(`/bids/${bidId}/accept`)
};

// Transaction API
export const transactionAPI = {
  createTransaction: (data) => api.post('/transactions', data),
  getUserTransactions: () => api.get('/transactions'),
  getTransactionById: (id) => api.get(`/transactions/${id}`),
  confirmSellerAppointment: (id, data) => api.post(`/transactions/${id}/seller-appointment/confirm`, data),
  confirmBuyerAppointment: (id, data) => api.post(`/transactions/${id}/buyer-appointment/confirm`, data),
  completeSellerAppointment: (id) => api.post(`/transactions/${id}/seller-appointment/complete`),
  completeBuyerAppointment: (id) => api.post(`/transactions/${id}/buyer-appointment/complete`)
};

// Admin API
export const adminAPI = {
  getAllUsers: (params) => api.get('/admin/users', { params: { ...params, _t: Date.now() } }),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  reviewKYC: (userId, kycStatus, notes) => api.put(`/admin/users/${userId}/kyc`, { kycStatus, notes }),
  updateUserRole: (userId, data) => api.put(`/admin/users/${userId}/role`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  getAllPhones: (params) => api.get('/admin/phones', { params: { ...params, _t: Date.now() } }),
  getPhoneById: (id) => api.get(`/admin/phones/${id}`),
  getPhoneBids: (phoneId) => api.get(`/admin/phones/${phoneId}/bids`),
  verifyPhone: (phoneId, data) => api.put(`/admin/phones/${phoneId}/verify`, data),
  deletePhone: (id) => api.delete(`/admin/phones/${id}`),
  getAllTransactions: (params) => api.get('/admin/transactions', { params }),
  getAllBids: (params) => api.get('/admin/bids', { params }),
  updateTransactionNotes: (id, adminNotes) => api.put(`/admin/transactions/${id}/notes`, { adminNotes }),
  searchByIds: (query) => api.get('/admin/search', { params: { query } }),
  getPlatformStatistics: () => api.get('/admin/statistics'),
  getSoldPhones: (params) => api.get('/admin/sold-phones', { params }),
  getAllComplaints: (params) => api.get('/admin/complaints', { params }),
  updateComplaint: (id, data) => api.put(`/admin/complaints/${id}`, data)
};

// Reel API
export const reelAPI = {
  uploadReel: (formData, onUploadProgress) => {
    return api.post('/reels/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress
    });
  },
  getAllReels: (page = 1, limit = 10) => api.get('/reels/all', { params: { page, limit } }),
  getUserReels: (userId, page = 1, limit = 12) => api.get(`/reels/user/${userId}`, { params: { page, limit } }),
  getUserReelStats: (userId) => api.get(`/reels/user/${userId}/stats`),
  getMyReels: (page = 1, limit = 12) => api.get('/reels/my/reels', { params: { page, limit } }),
  getReelById: (id) => api.get(`/reels/${id}`),
  incrementView: (id) => api.post(`/reels/${id}/view`),
  deleteReel: (id) => api.delete(`/reels/${id}`),
  toggleLike: (id) => api.post(`/reels/${id}/like`),
  checkLikeStatus: (id) => api.get(`/reels/${id}/like/status`),
  getComments: (id, page = 1, limit = 20) => api.get(`/reels/${id}/comments`, { params: { page, limit } }),
  addComment: (id, text) => api.post(`/reels/${id}/comments`, { text }),
  deleteComment: (reelId, commentId) => api.delete(`/reels/${reelId}/comments/${commentId}`)
};

// Complaint API
export const complaintAPI = {
  createComplaint: (data) => api.post('/complaints', data),
  getUserComplaints: () => api.get('/complaints/my-complaints'),
  getComplaintById: (id) => api.get(`/complaints/${id}`),
  getAllComplaints: (params) => api.get('/complaints', { params }),
  updateComplaintStatus: (id, data) => api.put(`/complaints/${id}`, data),
  deleteComplaint: (id) => api.delete(`/complaints/${id}`),
  getComplaintStats: () => api.get('/complaints/stats/overview')
};

// Chatbot API
export const chatbotAPI = {
  sendMessage: (message) => api.post('/chatbot/message', { message }),
  getInfo: () => api.get('/chatbot/info'),
  getPhoneData: () => api.get('/chatbot/phones'),
  healthCheck: () => api.get('/chatbot/health')
};

export default api;
