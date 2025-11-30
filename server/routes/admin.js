import express from 'express';
import {
  getAllUsers,
  getUserById,
  reviewKYC,
  getAllPhones,
  getPhoneById,
  getAllTransactions,
  updateTransactionNotes,
  searchByIds,
  getPlatformStatistics
} from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/accessControl.js';
import Phone from '../models/Phone.js';
import Bid from '../models/Bid.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(requireAuth, requireAdmin);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:userId/kyc', reviewKYC);

// Phone management
router.get('/phones', getAllPhones);
router.get('/phones/:id', getPhoneById);
router.put('/phones/:id/verify', async (req, res, next) => {
  try {
    const { verificationStatus } = req.body;
    const phone = await Phone.findByIdAndUpdate(
      req.params.id,
      { verificationStatus, status: verificationStatus === 'approved' ? 'live' : 'rejected' },
      { new: true }
    );
    res.json({ success: true, data: phone });
  } catch (error) {
    next(error);
  }
});

// Bid management
router.get('/bids', async (req, res, next) => {
  try {
    const bids = await Bid.find(req.query).sort({ timestamp: -1 }).limit(100);
    res.json({ success: true, data: bids });
  } catch (error) {
    next(error);
  }
});

// Transaction management
router.get('/transactions', getAllTransactions);
router.put('/transactions/:id/notes', updateTransactionNotes);

// Search
router.get('/search', searchByIds);

// Statistics
router.get('/statistics', getPlatformStatistics);

export default router;
