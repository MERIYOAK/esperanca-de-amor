const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  discount: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  productIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  validFrom: {
    type: Date,
    required: true,
    default: Date.now
  },
  validUntil: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    required: true
  },
  maxUses: {
    type: Number,
    default: -1 // -1 means unlimited
  },
  usedCount: {
    type: Number,
    default: 0
  },
  claimedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    claimedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Index for active offers
offerSchema.index({ isActive: 1, validUntil: 1 });

// Method to check if offer is still valid
offerSchema.methods.isValid = function() {
  const now = new Date();
  return this.isActive && 
         now >= this.validFrom && 
         now <= this.validUntil &&
         (this.maxUses === -1 || this.usedCount < this.maxUses);
};

// Method to claim offer
offerSchema.methods.claim = function(userId) {
  if (!this.isValid()) {
    throw new Error('Offer is not valid');
  }
  
  // Check if user already claimed this offer
  const alreadyClaimed = this.claimedBy.some(claim => 
    claim.user.toString() === userId.toString()
  );
  
  if (alreadyClaimed) {
    throw new Error('User has already claimed this offer');
  }
  
  // Add user to claimedBy array
  this.claimedBy.push({
    user: userId,
    claimedAt: new Date()
  });
  
  // Increment used count
  this.usedCount += 1;
  
  return this.save();
};

module.exports = mongoose.model('Offer', offerSchema); 