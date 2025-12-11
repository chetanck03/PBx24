import Redis from 'ioredis';

// Redis client singleton
let redis = null;
let isConnected = false;

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  AUCTION: 30,        // Auction data - 30 seconds
  PHONE: 60,          // Phone data - 1 minute
  BIDS: 10,           // Bids list - 10 seconds (frequently updated)
  MARKETPLACE: 30,    // Marketplace listings - 30 seconds
  USER_PROFILE: 120,  // User profile - 2 minutes
};

/**
 * Initialize Redis connection
 */
export const initRedis = () => {
  // Check for Redis configuration
  const redisUrl = process.env.REDIS_URL;
  const redisHost = process.env.REDIS_HOST;
  const redisPort = process.env.REDIS_PORT;
  const redisUsername = process.env.REDIS_USERNAME;
  const redisPassword = process.env.REDIS_PASSWORD;
  
  // Skip Redis initialization if no configuration is provided
  if (!redisUrl && !redisHost) {
    console.log('⚠️ Redis not configured - running without cache');
    return null;
  }
  
  try {
    let redisConfig;
    
    if (redisUrl) {
      // Use Redis URL
      redisConfig = redisUrl;
    } else {
      // Use individual Redis parameters
      redisConfig = {
        host: redisHost,
        port: parseInt(redisPort) || 6379,
        username: redisUsername || 'default',
        password: redisPassword,
      };
    }
    
    redis = new Redis(redisConfig, {
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,
      enableReadyCheck: true,
      lazyConnect: true,
      connectTimeout: 10000,
      commandTimeout: 5000,
      family: 4, // Force IPv4
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
      isConnected = true;
    });

    redis.on('ready', () => {
      console.log('✅ Redis ready for commands');
      isConnected = true;
    });

    redis.on('error', (err) => {
      console.error('❌ Redis connection error:', err.message);
      isConnected = false;
    });

    redis.on('close', () => {
      console.log('⚠️ Redis connection closed - running without cache');
      isConnected = false;
    });

    redis.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });

    // Connect with timeout
    redis.connect().catch(err => {
      console.error('⚠️ Redis connection failed - running without cache:', err.message);
      isConnected = false;
    });

    return redis;
  } catch (error) {
    console.error('⚠️ Failed to initialize Redis - running without cache:', error.message);
    return null;
  }
};

/**
 * Check if Redis is available
 */
export const isRedisAvailable = () => isConnected && redis !== null;

/**
 * Get cached data
 */
export const getCache = async (key) => {
  if (!isRedisAvailable()) return null;
  
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis get error:', error.message);
    return null;
  }
};

/**
 * Set cached data with TTL
 */
export const setCache = async (key, data, ttl = 60) => {
  if (!isRedisAvailable()) return false;
  
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Redis set error:', error.message);
    return false;
  }
};

/**
 * Delete cached data
 */
export const deleteCache = async (key) => {
  if (!isRedisAvailable()) return false;
  
  try {
    await redis.del(key);
    return true;
  } catch (error) {
    console.error('Redis delete error:', error.message);
    return false;
  }
};

/**
 * Delete multiple keys by pattern
 */
export const deleteCachePattern = async (pattern) => {
  if (!isRedisAvailable()) return false;
  
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
    return true;
  } catch (error) {
    console.error('Redis delete pattern error:', error.message);
    return false;
  }
};

// Cache key generators
export const cacheKeys = {
  auction: (id) => `auction:${id}`,
  auctionByPhone: (phoneId) => `auction:phone:${phoneId}`,
  phone: (id) => `phone:${id}`,
  bids: (auctionId) => `bids:${auctionId}`,
  marketplace: (page, limit) => `marketplace:${page}:${limit}`,
  marketplaceAll: () => 'marketplace:*',
  userProfile: (id) => `user:${id}`,
};

/**
 * Invalidate auction-related caches
 */
export const invalidateAuctionCache = async (auctionId, phoneId) => {
  await Promise.all([
    deleteCache(cacheKeys.auction(auctionId)),
    deleteCache(cacheKeys.auctionByPhone(phoneId)),
    deleteCache(cacheKeys.bids(auctionId)),
    deleteCachePattern(cacheKeys.marketplaceAll()),
  ]);
};

/**
 * Invalidate phone-related caches
 */
export const invalidatePhoneCache = async (phoneId) => {
  await Promise.all([
    deleteCache(cacheKeys.phone(phoneId)),
    deleteCache(cacheKeys.auctionByPhone(phoneId)),
    deleteCachePattern(cacheKeys.marketplaceAll()),
  ]);
};

export default {
  initRedis,
  isRedisAvailable,
  getCache,
  setCache,
  deleteCache,
  deleteCachePattern,
  cacheKeys,
  invalidateAuctionCache,
  invalidatePhoneCache,
  CACHE_TTL,
};
