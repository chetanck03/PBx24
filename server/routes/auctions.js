import express from 'express';
import {
  createAuction,
  getActiveAuctions,
  getAuctionById,
  getAuctionByPhoneId,
  endAuction,
  cancelAuction
} from '../controllers/auctionController.js';
import { requireAuth, requireAdmin, requireKYCVerified } from '../middleware/accessControl.js';

const router = express.Router();

// Public routes
router.get('/', getActiveAuctions);
router.get('/:id', getAuctionById);
router.get('/phone/:phoneId', getAuctionByPhoneId);

// Authenticated routes - KYC required for seller actions
router.post('/', requireAuth, requireAdmin, createAuction);
router.put('/:id/end', requireAuth, requireKYCVerified, endAuction);
router.put('/:id/cancel', requireAuth, requireKYCVerified, cancelAuction);

export default router;
