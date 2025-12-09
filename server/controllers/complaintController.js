import Complaint from '../models/Complaint.js';
import User from '../models/User.js';

/**
 * Create a new complaint
 */
export const createComplaint = async (req, res) => {
  try {
    const { subject, description, userEmail, proof, category, priority, relatedPhone, relatedAuction, relatedTransaction } = req.body;

    
    if (!subject || !description || !category || !userEmail) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Subject, description, email, and category are required',
          code: 'MISSING_FIELDS'
        }
      });
    }
    
    const complaint = new Complaint({
      userId: req.userId,
      subject,
      description,
      userEmail,
      proof: proof || '',
      category,
      priority: priority || 'medium',
      relatedPhone,
      relatedAuction,
      relatedTransaction
    });
    
    await complaint.save();
    console.log('Complaint saved successfully:', complaint._id);
    
    res.status(201).json({
      success: true,
      data: complaint.toDetailedObject(),
      message: 'Complaint submitted successfully. Admin will review it soon.'
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error submitting complaint',
        code: 'CREATE_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * Get user's complaints
 */
export const getUserComplaints = async (req, res) => {
  try {
    console.log('Getting complaints for user:', req.userId);
    
    // First, let's check ALL complaints in the database for this user
    const allComplaints = await Complaint.find({ userId: req.userId });
    console.log('Raw complaints from DB:', allComplaints.length);
    
    // Check specifically for pending complaints
    const pendingComplaints = await Complaint.find({ userId: req.userId, status: 'pending' });
    console.log('Pending complaints found:', pendingComplaints.length);
    
    const complaints = await Complaint.find({ userId: req.userId })
      .sort({ createdAt: -1 })
      .populate('relatedPhone', 'brand model')
      .populate('resolvedBy', 'name email');
    
    console.log('Found complaints after populate:', complaints.length);
    console.log('Complaints data:', complaints.map(c => ({ id: c._id, subject: c.subject, status: c.status, createdAt: c.createdAt })));
    
    // Check status distribution
    const statusCounts = complaints.reduce((acc, c) => {
      acc[c.status] = (acc[c.status] || 0) + 1;
      return acc;
    }, {});
    console.log('Status distribution:', statusCounts);
    
    res.json({
      success: true,
      data: complaints.map(c => c.toDetailedObject()),
      count: complaints.length
    });
  } catch (error) {
    console.error('Error fetching user complaints:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching complaints',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * Get complaint by ID
 */
export const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const complaint = await Complaint.findById(id)
      .populate('userId', 'name email anonymousId')
      .populate('relatedPhone', 'brand model storage')
      .populate('resolvedBy', 'name email');
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Complaint not found',
          code: 'NOT_FOUND'
        }
      });
    }
    
    // Check if user owns this complaint or is admin
    if (complaint.userId._id.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Access denied',
          code: 'NOT_AUTHORIZED'
        }
      });
    }
    
    res.json({
      success: true,
      data: complaint.toDetailedObject()
    });
  } catch (error) {
    console.error('Error fetching complaint:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching complaint',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * Get all complaints (Admin only)
 */
export const getAllComplaints = async (req, res) => {
  try {
    const { status, category, priority } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;
    
    const complaints = await Complaint.find(filter)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email anonymousId')
      .populate('relatedPhone', 'brand model')
      .populate('resolvedBy', 'name email');
    
    res.json({
      success: true,
      data: complaints.map(c => c.toDetailedObject()),
      count: complaints.length
    });
  } catch (error) {
    console.error('Error fetching complaints:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching complaints',
        code: 'FETCH_ERROR'
      }
    });
  }
};

/**
 * Update complaint status (Admin only)
 */
export const updateComplaintStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminResponse, adminNotes, priority } = req.body;
    
    const complaint = await Complaint.findById(id);
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Complaint not found',
          code: 'NOT_FOUND'
        }
      });
    }
    
    if (status) complaint.status = status;
    if (adminResponse) complaint.adminResponse = adminResponse;
    if (adminNotes) complaint.adminNotes = adminNotes;
    if (priority) complaint.priority = priority;
    
    if (status === 'resolved' || status === 'closed') {
      complaint.resolvedBy = req.userId;
      complaint.resolvedAt = new Date();
    }
    
    await complaint.save();
    
    res.json({
      success: true,
      data: complaint.toDetailedObject(),
      message: 'Complaint updated successfully'
    });
  } catch (error) {
    console.error('Error updating complaint:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error updating complaint',
        code: 'UPDATE_ERROR',
        details: error.message
      }
    });
  }
};

/**
 * Delete complaint (Admin only)
 */
export const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    
    const complaint = await Complaint.findByIdAndDelete(id);
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Complaint not found',
          code: 'NOT_FOUND'
        }
      });
    }
    
    res.json({
      success: true,
      message: 'Complaint deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error deleting complaint',
        code: 'DELETE_ERROR'
      }
    });
  }
};

/**
 * Get complaint statistics (Admin only)
 */
export const getComplaintStats = async (req, res) => {
  try {
    const [
      totalComplaints,
      pendingComplaints,
      inProgressComplaints,
      resolvedComplaints,
      categoryStats,
      priorityStats
    ] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: 'pending' }),
      Complaint.countDocuments({ status: 'in_progress' }),
      Complaint.countDocuments({ status: 'resolved' }),
      Complaint.aggregate([
        { $group: { _id: '$category', count: { $sum: 1 } } }
      ]),
      Complaint.aggregate([
        { $group: { _id: '$priority', count: { $sum: 1 } } }
      ])
    ]);
    
    res.json({
      success: true,
      data: {
        total: totalComplaints,
        pending: pendingComplaints,
        inProgress: inProgressComplaints,
        resolved: resolvedComplaints,
        byCategory: categoryStats,
        byPriority: priorityStats
      }
    });
  } catch (error) {
    console.error('Error fetching complaint stats:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Error fetching statistics',
        code: 'STATS_ERROR'
      }
    });
  }
};

export default {
  createComplaint,
  getUserComplaints,
  getComplaintById,
  getAllComplaints,
  updateComplaintStatus,
  deleteComplaint,
  getComplaintStats
};
