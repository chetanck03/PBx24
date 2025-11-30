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
import { requireAuth, requireAdmin } from '../middleware/accessControl.js';

const router = express.Router();

// Authenticated routes
router.post('/', requireAuth, requireAdmin, createTransaction);
router.get('/', requireAuth, getUserTransactions);
router.get('/:id', requireAuth, getTransactionById);

// Appointment routes
router.post('/:id/seller-appointment/confirm', requireAuth, confirmSellerAppointment);
router.post('/:id/buyer-appointment/confirm', requireAuth, confirmBuyerAppointment);
router.post('/:id/seller-appointment/complete', requireAuth, completeSellerAppointment);
router.post('/:id/buyer-appointment/complete', requireAuth, completeBuyerAppointment);

export default router;
