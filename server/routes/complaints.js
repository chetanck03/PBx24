import express from 'express';
import {
  createComplaint,
  getUserComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint,
  getComplaintStats
} from '../controllers/complaintController.js';
import { requireAuth, requireAdmin } from '../middleware/accessControl.js';

const router = express.Router();

// User routes (authenticated)
router.post('/', requireAuth, createComplaint);
router.get('/my-complaints', requireAuth, getUserComplaints);
router.get('/:id', requireAuth, getComplaintById);

// Admin routes
router.get('/', requireAuth, requireAdmin, getAllComplaints);
router.put('/:id', requireAuth, requireAdmin, updateComplaintStatus);
router.delete('/:id', requireAuth, requireAdmin, deleteComplaint);
router.get('/stats/overview', requireAuth, requireAdmin, getComplaintStats);

export default router;
