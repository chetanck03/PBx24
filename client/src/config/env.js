// Environment configuration
const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'PhoneBid',
  GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  
  // Environment checks
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  
  // API endpoints
  endpoints: {
    auth: {
      google: '/auth/google',
      me: '/auth/me',
      logout: '/auth/logout'
    },
    listings: {
      base: '/listings',
      myListings: '/listings/my-listings',
      detail: (id) => `/listings/${id}`
    },
    bids: {
      base: '/bids',
      myBids: '/bids/my-bids',
      listingBids: (listingId) => `/bids/listing/${listingId}`,
      select: (bidId) => `/bids/${bidId}/select`
    },
    admin: {
      base: '/admin',
      statistics: '/admin/statistics',
      transactions: '/admin/transactions',
      users: '/admin/users',
      approveTransaction: (id) => `/admin/transactions/${id}/approve`,
      flagTransaction: (id) => `/admin/transactions/${id}/flag`
    }
  }
};

export default config;