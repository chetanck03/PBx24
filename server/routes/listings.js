import express from 'express';
import {
  getListings,
  getListing,
  createListing,
  getUserListings,
  updateListing,
  deleteListing
} from '../controllers/listingController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getListings);
router.get('/my-listings', authenticateToken, getUserListings);
router.get('/:id', getListing);
router.post('/', authenticateToken, createListing);
router.put('/:id', authenticateToken, updateListing);
router.delete('/:id', authenticateToken, deleteListing);

export default router;