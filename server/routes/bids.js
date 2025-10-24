import express from 'express';
import {
  placeBid,
  getListingBids,
  getUserBids,
  selectWinningBid
} from '../controllers/bidController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticateToken, placeBid);
router.get('/my-bids', authenticateToken, getUserBids);
router.get('/listing/:listingId', getListingBids);
router.put('/:bidId/select', authenticateToken, selectWinningBid);

export default router;