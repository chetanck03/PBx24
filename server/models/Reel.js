import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: [300, 'Comment cannot exceed 300 characters']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const reelSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  videoUrl: {
    type: String,
    required: true
  },
  thumbnailUrl: {
    type: String,
    required: true
  },
  cloudinaryPublicId: {
    type: String,
    required: true
  },
  duration: {
    type: Number,
    required: true,
    max: [30, 'Video duration cannot exceed 30 seconds']
  },
  description: {
    type: String,
    default: '',
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  comments: [commentSchema],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for efficient queries
reelSchema.index({ createdAt: -1 });
reelSchema.index({ userId: 1, createdAt: -1 });

// Virtual for likes count
reelSchema.virtual('likesCount').get(function() {
  return this.likes?.length || 0;
});

// Virtual for comments count
reelSchema.virtual('commentsCount').get(function() {
  return this.comments?.length || 0;
});

// Ensure virtuals are included in JSON
reelSchema.set('toJSON', { virtuals: true });
reelSchema.set('toObject', { virtuals: true });

export default mongoose.model('Reel', reelSchema);
