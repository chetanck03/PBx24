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
  deletePhone
} from '../controllers/phoneController.js';
import { requireAuth, requireAdmin, requireSeller } from '../middleware/accessControl.js';

const router = express.Router();

// Public routes
router.get('/', getAllPhones);

// Seller routes (must be before /:id to avoid conflicts)
router.post('/', requireAuth, requireSeller, createPhone);
router.get('/seller/my-phones', requireAuth, requireSeller, getSellerPhones);
router.get('/seller/sold', requireAuth, getSoldPhones);
router.get('/user/purchased', requireAuth, getPurchasedPhones);

// Dynamic routes
router.get('/:id', getPhoneById);
router.put('/:id', requireAuth, updatePhone);
router.delete('/:id', requireAuth, deletePhone);

// Admin routes
router.put('/:id/verify', requireAuth, requireAdmin, verifyPhone);

export default router;
