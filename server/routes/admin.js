import express from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
  getAllTransactions,
  approveTransaction,
  flagTransaction,
  getAllUsers,
  getPlatformStatistics
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Transaction management
router.get('/transactions', getAllTransactions);
router.put('/transactions/:id/approve', approveTransaction);
router.put('/transactions/:id/flag', flagTransaction);

// User management
router.get('/users', getAllUsers);

// Platform statistics
router.get('/statistics', getPlatformStatistics);

export default router;