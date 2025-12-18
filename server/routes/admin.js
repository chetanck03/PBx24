import express from 'express';
import {
  getAllUsers,
  getUserById,
  reviewKYC,
  updateUserRole,
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
router.put('/users/:userId/role', updateUserRole);
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
router.get('/phones/:id/status', async (req, res) => {
  try {
    const phone = await Phone.findById(req.params.id);
    if (!phone) {
      return res.status(404).json({ success: false, error: { message: 'Phone not found' } });
    }
    res.json({
      success: true,
      data: {
        _id: phone._id,
        verificationStatus: phone.verificationStatus,
        status: phone.status,
        updatedAt: phone.updatedAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: { message: error.message } });
  }
});
router.get('/phones/:phoneId/bids', getPhoneBids);
router.put('/phones/:id/verify', async (req, res, next) => {
  try {
    const { verificationStatus, adminNotes } = req.body;
    
    if (!['approved', 'rejected', 'pending'].includes(verificationStatus)) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Invalid verification status' } 
      });
    }
    
    const phone = await Phone.findById(req.params.id);
    if (!phone) {
      return res.status(404).json({ success: false, error: { message: 'Phone not found' } });
    }
    
    phone.verificationStatus = verificationStatus;
    if (adminNotes) phone.adminNotes = adminNotes;
    
    let auction = null;
    
    if (verificationStatus === 'approved') {
      phone.status = 'live';
      
      // Create auction automatically
      const Auction = (await import('../models/Auction.js')).default;
      const existingAuction = await Auction.findOne({ phoneId: phone._id }).lean();
      
      if (!existingAuction) {
        const auctionEndTime = phone.auctionEndTime || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        auction = new Auction({
          phoneId: phone._id,
          sellerId: phone.sellerId,
          anonymousSellerId: phone.anonymousSellerId,
          startingBid: phone.minBidPrice,
          currentBid: 0,
          auctionEndTime,
          status: 'active'
        });
        // Save phone and auction in parallel
        await Promise.all([phone.save(), auction.save()]);
      } else {
        await phone.save();
        auction = existingAuction;
      }
      
      // Emit WebSocket event for real-time marketplace update
      const io = req.app.get('io');
      if (io) {
        const newListingData = {
          phone: phone.toPublicObject(),
          auction: auction ? {
            _id: auction._id,
            currentBid: auction.currentBid || 0,
            totalBids: auction.totalBids || 0,
            auctionEndTime: auction.auctionEndTime,
            status: auction.status
          } : null
        };
        io.to('marketplace').emit('new_listing', newListingData);
      }
    } else {
      if (verificationStatus === 'rejected') phone.status = 'rejected';
      await phone.save();
    }
    
    res.json({ 
      success: true, 
      data: phone.toAdminObject(),
      message: `Phone ${verificationStatus} successfully${verificationStatus === 'approved' ? ' and auction created' : ''}`
    });
  } catch (error) {
    console.error('Error verifying phone:', error.message);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to verify phone', details: error.message }
    });
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
