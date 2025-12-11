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
    console.log(`\n=== PHONE VERIFICATION START ===`);
    console.log(`Verifying phone ${req.params.id} with status: ${verificationStatus}`);
    console.log(`Request body:`, req.body);
    
    const phone = await Phone.findById(req.params.id);
    
    if (!phone) {
      console.log(`Phone not found: ${req.params.id}`);
      return res.status(404).json({ success: false, error: { message: 'Phone not found' } });
    }
    
    console.log(`Phone found: ${phone._id}`);
    console.log(`Current verification status: ${phone.verificationStatus}`);
    console.log(`Current phone status: ${phone.status}`);
    
    if (!['approved', 'rejected', 'pending'].includes(verificationStatus)) {
      return res.status(400).json({ 
        success: false, 
        error: { message: 'Invalid verification status' } 
      });
    }
    
    console.log(`\n--- UPDATING PHONE ---`);
    console.log(`Setting verificationStatus from "${phone.verificationStatus}" to "${verificationStatus}"`);
    
    phone.verificationStatus = verificationStatus;
    if (adminNotes) {
      console.log(`Adding admin notes: ${adminNotes}`);
      phone.adminNotes = adminNotes;
    }
    
    if (verificationStatus === 'approved') {
      console.log(`Setting phone status to 'live'`);
      phone.status = 'live';
      
      // Create auction automatically when phone is approved
      const Auction = (await import('../models/Auction.js')).default;
      const existingAuction = await Auction.findOne({ phoneId: phone._id });
      
      if (!existingAuction) {
        console.log(`Creating auction for approved phone`);
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
      } else {
        console.log('Auction already exists for this phone');
      }
    } else if (verificationStatus === 'rejected') {
      console.log(`Setting phone status to 'rejected'`);
      phone.status = 'rejected';
    }
    
    console.log(`\n--- SAVING PHONE ---`);
    console.log(`About to save phone with verificationStatus: ${phone.verificationStatus}, status: ${phone.status}`);
    
    // Save the phone once after all modifications
    const savedPhone = await phone.save();
    console.log(`Phone saved successfully!`);
    console.log(`Saved phone verificationStatus: ${savedPhone.verificationStatus}`);
    console.log(`Saved phone status: ${savedPhone.status}`);
    
    // Verify the save by fetching from database
    console.log(`\n--- VERIFICATION CHECKS ---`);
    const verifyPhone = await Phone.findById(phone._id);
    console.log(`DB Check 1 - verificationStatus: ${verifyPhone.verificationStatus}, status: ${verifyPhone.status}`);
    
    // Double check with a fresh query
    const freshPhone = await Phone.findOne({ _id: phone._id });
    console.log(`DB Check 2 - verificationStatus: ${freshPhone.verificationStatus}, status: ${freshPhone.status}`);
    
    console.log(`\n--- SENDING RESPONSE ---`);
    const responseData = freshPhone.toAdminObject();
    console.log(`Response data verificationStatus: ${responseData.verificationStatus}`);
    console.log(`Response data status: ${responseData.status}`);
    console.log(`=== PHONE VERIFICATION END ===\n`);
    
    res.json({ 
      success: true, 
      data: responseData,
      message: `Phone ${verificationStatus} successfully${verificationStatus === 'approved' ? ' and auction created' : ''}`
    });
  } catch (error) {
    console.error('Error verifying phone:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to verify phone',
        details: error.message
      }
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
