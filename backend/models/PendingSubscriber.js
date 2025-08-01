const mongoose = require('mongoose');

const pendingSubscriberSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  name: {
    type: String,
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  confirmationToken: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: function() {
      // Set expiration to 24 hours from now
      return new Date(Date.now() + 24 * 60 * 60 * 1000);
    }
  },
  source: {
    type: String,
    enum: ['homepage', 'footer', 'other'],
    default: 'other'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

// Index for automatic cleanup
pendingSubscriberSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for email lookups
pendingSubscriberSchema.index({ email: 1 });

// Index for token lookups
pendingSubscriberSchema.index({ confirmationToken: 1 });

// Method to check if token is expired
pendingSubscriberSchema.methods.isExpired = function() {
  return new Date() > this.expiresAt;
};

// Method to generate new confirmation token
pendingSubscriberSchema.methods.generateConfirmationToken = function() {
  const crypto = require('crypto');
  this.confirmationToken = crypto.randomBytes(32).toString('hex');
  this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  return this.confirmationToken;
};

// Static method to cleanup expired tokens
pendingSubscriberSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  return result.deletedCount;
};

// Static method to find by token
pendingSubscriberSchema.statics.findByToken = function(token) {
  return this.findOne({ 
    confirmationToken: token,
    expiresAt: { $gt: new Date() }
  });
};

module.exports = mongoose.model('PendingSubscriber', pendingSubscriberSchema); 