import express from 'express';
import {
  createPhone,
  getAllPhones,
  getPhoneById,
  getSellerPhones,
  updatePhone,
  verifyPhone,
  deletePhone
} from '../controllers/phoneController.js';
import { requireAuth, requireAdmin, requireSeller } from '../middleware/accessControl.js';

const router = express.Router();

// Public routes
router.get('/', getAllPhones);
router.get('/:id', getPhoneById);

// Seller routes
router.post('/', requireAuth, requireSeller, createPhone);
router.get('/seller/my-phones', requireAuth, requireSeller, getSellerPhones);
router.put('/:id', requireAuth, updatePhone);
router.delete('/:id', requireAuth, deletePhone);

// Admin routes
router.put('/:id/verify', requireAuth, requireAdmin, verifyPhone);

export default router;
