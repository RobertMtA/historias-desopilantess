const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userName: {
    type: String,
    required: true,
    trim: true
  },
  comment: {
    type: String,
    required: true,
    trim: true
  },
  storyId: {
    type: String,
    required: true
  },
  storyTitle: {
    type: String
  },
  storyCategory: {
    type: String
  },
  ip: {
    type: String
  },
  userAgent: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  approved: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Índices para mejorar el rendimiento
commentSchema.index({ storyId: 1 });
commentSchema.index({ createdAt: -1 });
commentSchema.index({ approved: 1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
