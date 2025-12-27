import express from 'express';
import {
  createPhone,
  getAllPhones,
  getPhoneById,
  getSellerPhones,
  getSoldPhones,
  getPurchasedPhones,
  updatePhone,
  verifyPhone,
  deletePhone,
  getMarketplacePhones
} from '../controllers/phoneController.js';
import { requireAuth, requireAdmin, requireSeller, requireKYCVerified } from '../middleware/accessControl.js';

const router = express.Router();

// Public routes - marketplace optimized endpoint (single call for phones + auctions)
router.get('/marketplace', getMarketplacePhones);
router.get('/', getAllPhones);

// Seller routes (must be before /:id to avoid conflicts)
// KYC REQUIRED for creating, updating, and deleting listings
router.post('/', requireAuth, requireSeller, requireKYCVerified, createPhone);
router.get('/seller/my-phones', requireAuth, requireSeller, getSellerPhones);
router.get('/seller/sold', requireAuth, getSoldPhones);
router.get('/user/purchased', requireAuth, getPurchasedPhones);

// Dynamic routes - KYC required for modifying listings
router.get('/:id', getPhoneById);
router.put('/:id', requireAuth, requireKYCVerified, updatePhone);
router.delete('/:id', requireAuth, requireKYCVerified, deletePhone);

// Admin routes
router.put('/:id/verify', requireAuth, requireAdmin, verifyPhone);

export default router;
