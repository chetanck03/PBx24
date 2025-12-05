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
  getPlatformStatistics,
  getPhoneBids,
  getAllBids
} from '../controllers/adminController.js';
import { requireAuth, requireAdmin } from '../middleware/accessControl.js';
import Phone from '../models/Phone.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(requireAuth, requireAdmin);

// User management
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:userId/kyc', reviewKYC);
router.delete('/users/:id', async (req, res, next) => {
  try {
    const { deleteUser } = await import('../controllers/adminController.js');
    await deleteUser(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Phone management
router.get('/phones', getAllPhones);
router.get('/phones/:id', getPhoneById);
router.get('/phones/:phoneId/bids', getPhoneBids);
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
router.delete('/phones/:id', async (req, res, next) => {
  try {
    const { deletePhone } = await import('../controllers/adminController.js');
    await deletePhone(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Bid management
router.get('/bids', getAllBids);

// Transaction management
router.get('/transactions', getAllTransactions);
router.put('/transactions/:id/notes', updateTransactionNotes);

// Search
router.get('/search', searchByIds);

// Statistics
router.get('/statistics', getPlatformStatistics);

// Complaint management
import { getAllComplaints, updateComplaintStatus } from '../controllers/complaintController.js';
router.get('/complaints', getAllComplaints);
router.put('/complaints/:id', updateComplaintStatus);

export default router;
