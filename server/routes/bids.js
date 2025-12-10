import express from 'express';
import {
  placeBid,
  getAuctionBids,
  getUserBids,
  acceptBid,
  getSellerAuctionBids
} from '../controllers/bidController.js';
import { requireAuth, optionalAuth } from '../middleware/accessControl.js';

const router = express.Router();

// Public routes (anyone can view bids, but auth is optional for personalized view)
router.get('/auction/:auctionId', optionalAuth, getAuctionBids);

// Authenticated routes
router.post('/', requireAuth, placeBid);
router.get('/my-bids', requireAuth, getUserBids);
router.get('/seller/auction/:auctionId', requireAuth, getSellerAuctionBids);
router.post('/:bidId/accept', requireAuth, acceptBid);

export default router;
