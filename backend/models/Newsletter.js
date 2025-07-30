const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  unsubscribedAt: {
    type: Date,
    default: null
  },
  lastEmailSent: {
    type: Date,
    default: null
  },
  emailCount: {
    type: Number,
    default: 0
  },
  preferences: {
    promotions: {
      type: Boolean,
      default: true
    },
    newProducts: {
      type: Boolean,
      default: true
    },
    weeklyNewsletter: {
      type: Boolean,
      default: true
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance (email index is automatically created by unique: true)
newsletterSchema.index({ isActive: 1 });
newsletterSchema.index({ subscribedAt: -1 });

// Method to unsubscribe
newsletterSchema.methods.unsubscribe = function() {
  this.isActive = false;
  this.unsubscribedAt = new Date();
  return this.save();
};

// Method to resubscribe
newsletterSchema.methods.resubscribe = function() {
  this.isActive = true;
  this.unsubscribedAt = null;
  return this.save();
};

// Method to update email count
newsletterSchema.methods.incrementEmailCount = function() {
  this.emailCount += 1;
  this.lastEmailSent = new Date();
  return this.save();
};

// Static method to get active subscribers
newsletterSchema.statics.getActiveSubscribers = function() {
  return this.find({ isActive: true }).select('name email preferences');
};

// Static method to get subscribers by preference
newsletterSchema.statics.getSubscribersByPreference = function(preference) {
  return this.find({
    isActive: true,
    [`preferences.${preference}`]: true
  }).select('name email');
};

module.exports = mongoose.model('Newsletter', newsletterSchema); 