const mongoose = require('mongoose');

const StoryInteractionSchema = new mongoose.Schema({
  storyId: {
    type: Number,
    required: true,
    index: true
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    userName: {
      type: String,
      required: true,
      maxLength: 50
    },
    comment: {
      type: String,
      required: true,
      maxLength: 500
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    ip: {
      type: String,
      required: false
    }
  }],
  likedIPs: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Índice compuesto para mejorar las consultas
StoryInteractionSchema.index({ storyId: 1, 'comments.createdAt': -1 });

// Middleware para actualizar updatedAt
StoryInteractionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('StoryInteraction', StoryInteractionSchema);
