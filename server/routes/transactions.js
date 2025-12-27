import express from 'express';
import {
  createTransaction,
  getUserTransactions,
  getTransactionById,
  confirmSellerAppointment,
  confirmBuyerAppointment,
  completeSellerAppointment,
  completeBuyerAppointment
} from '../controllers/transactionController.js';
import { requireAuth, requireAdmin, requireKYCVerified } from '../middleware/accessControl.js';

const router = express.Router();

// Authenticated routes
router.post('/', requireAuth, requireAdmin, createTransaction);
router.get('/', requireAuth, getUserTransactions);
router.get('/:id', requireAuth, getTransactionById);

// Appointment routes - KYC required for transaction actions
router.post('/:id/seller-appointment/confirm', requireAuth, requireKYCVerified, confirmSellerAppointment);
router.post('/:id/buyer-appointment/confirm', requireAuth, requireKYCVerified, confirmBuyerAppointment);
router.post('/:id/seller-appointment/complete', requireAuth, requireKYCVerified, completeSellerAppointment);
router.post('/:id/buyer-appointment/complete', requireAuth, requireKYCVerified, completeBuyerAppointment);

export default router;
