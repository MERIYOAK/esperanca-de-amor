const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'error', 'promotion'],
    default: 'info'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      default: ''
    },
    caption: {
      type: String,
      default: ''
    }
  }],
  targetAudience: {
    type: String,
    enum: ['all', 'registered', 'guests'],
    default: 'all'
  },
  displayLocation: {
    type: String,
    enum: ['top', 'bottom', 'sidebar', 'modal'],
    default: 'top'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  views: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for active announcements
announcementSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// Method to check if announcement is currently active
announcementSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && 
         now >= this.startDate && 
         now <= this.endDate;
};

// Virtual for time remaining
announcementSchema.virtual('timeRemaining').get(function() {
  if (!this.isCurrentlyActive()) return 0;
  return this.endDate - new Date();
});

// Method to increment views
announcementSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save();
};

// Method to increment clicks
announcementSchema.methods.incrementClicks = function() {
  this.clicks += 1;
  return this.save();
};

module.exports = mongoose.model('Announcement', announcementSchema); 