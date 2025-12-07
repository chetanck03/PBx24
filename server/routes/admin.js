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
    const { verificationStatus, adminNotes } = req.body;
    const phone = await Phone.findById(req.params.id);
    
    if (!phone) {
      return res.status(404).json({ success: false, error: { message: 'Phone not found' } });
    }
    
    phone.verificationStatus = verificationStatus;
    if (adminNotes) phone.adminNotes = adminNotes;
    
    if (verificationStatus === 'approved') {
      phone.status = 'live';
      await phone.save();
      
      // Create auction automatically when phone is approved
      const Auction = (await import('../models/Auction.js')).default;
      const existingAuction = await Auction.findOne({ phoneId: phone._id });
      
      if (!existingAuction) {
        // Set default auction end time if not set (7 days from now)
        const auctionEndTime = phone.auctionEndTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        
        const auction = new Auction({
          phoneId: phone._id,
          sellerId: phone.sellerId,
          anonymousSellerId: phone.anonymousSellerId,
          startingBid: phone.minBidPrice,
          currentBid: 0,
          auctionEndTime: auctionEndTime,
          status: 'active'
        });
        await auction.save();
        console.log('Auction created for phone:', phone._id);
      }
    } else {
      phone.status = 'rejected';
      await phone.save();
    }
    
    res.json({ 
      success: true, 
      data: phone,
      message: `Phone ${verificationStatus} successfully${verificationStatus === 'approved' ? ' and auction created' : ''}`
    });
  } catch (error) {
    console.error('Error verifying phone:', error);
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

// Sold phones
router.get('/sold-phones', async (req, res, next) => {
  try {
    const { getSoldPhones } = await import('../controllers/adminController.js');
    await getSoldPhones(req, res, next);
  } catch (error) {
    next(error);
  }
});

// Complaint management
import { getAllComplaints, updateComplaintStatus } from '../controllers/complaintController.js';
router.get('/complaints', getAllComplaints);
router.put('/complaints/:id', updateComplaintStatus);

export default router;
