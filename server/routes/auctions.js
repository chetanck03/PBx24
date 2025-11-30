import express from 'express';
import {
  createAuction,
  getActiveAuctions,
  getAuctionById,
  getAuctionByPhoneId,
  endAuction,
  cancelAuction
} from '../controllers/auctionController.js';
import { requireAuth, requireAdmin } from '../middleware/accessControl.js';

const router = express.Router();

// Public routes
router.get('/', getActiveAuctions);
router.get('/:id', getAuctionById);
router.get('/phone/:phoneId', getAuctionByPhoneId);

// Authenticated routes
router.post('/', requireAuth, requireAdmin, createAuction);
router.put('/:id/end', requireAuth, endAuction);
router.put('/:id/cancel', requireAuth, cancelAuction);

export default router;
