import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Complaint details
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },
  
  // User's email (for contact)
  userEmail: {
    type: String,
    required: true,
    trim: true
  },
  
  // Proof/Evidence (optional - image URL or file path)
  proof: {
    type: String,
    default: ''
  },
  
  category: {
    type: String,
    enum: ['bidding', 'payment', 'phone_quality', 'seller_issue', 'buyer_issue', 'technical', 'other'],
    required: true
  },
  
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'resolved', 'closed'],
    default: 'pending'
  },
  
  // Related entities (optional)
  relatedPhone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Phone'
  },
  
  relatedAuction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction'
  },
  
  relatedTransaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  
  // Admin response
  adminResponse: {
    type: String,
    default: ''
  },
  
  adminNotes: {
    type: String,
    default: ''
  },
  
  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  
  resolvedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes
complaintSchema.index({ userId: 1, status: 1 });
complaintSchema.index({ status: 1, priority: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ createdAt: -1 });

// Method to get complaint with user details
complaintSchema.methods.toDetailedObject = function() {
  return {
    _id: this._id,
    userId: this.userId,
    subject: this.subject,
    description: this.description,
    userEmail: this.userEmail,
    proof: this.proof,
    category: this.category,
    priority: this.priority,
    status: this.status,
    relatedPhone: this.relatedPhone,
    relatedAuction: this.relatedAuction,
    relatedTransaction: this.relatedTransaction,
    adminResponse: this.adminResponse,
    adminNotes: this.adminNotes,
    resolvedBy: this.resolvedBy,
    resolvedAt: this.resolvedAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

export default mongoose.model('Complaint', complaintSchema);
