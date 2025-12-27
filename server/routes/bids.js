import express from 'express';
import {
  placeBid,
  getAuctionBids,
  getUserBids,
  acceptBid,
  getSellerAuctionBids
} from '../controllers/bidController.js';
import { requireAuth, optionalAuth, requireKYCVerified } from '../middleware/accessControl.js';

const router = express.Router();

// Public routes (anyone can view bids, but auth is optional for personalized view)
router.get('/auction/:auctionId', optionalAuth, getAuctionBids);

// Authenticated routes - viewing bids doesn't require KYC
router.get('/my-bids', requireAuth, getUserBids);
router.get('/seller/auction/:auctionId', requireAuth, getSellerAuctionBids);

// KYC REQUIRED routes - placing and accepting bids requires verified KYC
router.post('/', requireAuth, requireKYCVerified, placeBid);
router.post('/:bidId/accept', requireAuth, requireKYCVerified, acceptBid);

export default router;
