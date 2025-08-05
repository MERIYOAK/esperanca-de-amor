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
  // New fields for admin controller
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['discount', 'free_shipping', 'buy_one_get_one', 'cashback'],
    default: 'discount'
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  discountType: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed'],
    default: 'percentage'
  },
  minimumOrderAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maximumDiscountAmount: {
    type: Number,
    min: 0
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  usageLimit: {
    type: Number,
    default: null // null means unlimited
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  // Legacy fields for backward compatibility
  discount: {
    type: Number,
    min: 0,
    max: 100
  },
  category: {
    type: String,
    enum: {
      values: [
        'foodstuffs', 'household-items', 'beverages', 'electronics', 
        'construction-materials', 'plastics', 'cosmetics', 'powder-detergent', 
        'liquid-detergent', 'juices', 'dental-care', 'beef'
      ],
      message: 'Invalid category. Please select a valid category from the list.'
    }
  },
  productIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  validFrom: {
    type: Date,
    default: Date.now
  },
  validUntil: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    required: false
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
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: false
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Index for active offers
offerSchema.index({ isActive: 1, endDate: 1 });
offerSchema.index({ code: 1 });

// Method to check if offer is still valid
offerSchema.methods.isValid = function() {
  const now = new Date();
  return this.isActive && 
         now >= this.startDate && 
         now <= this.endDate &&
         (this.usageLimit === null || this.usedCount < this.usageLimit);
};

// Method to claim offer
offerSchema.methods.claim = function(userId) {
  if (!this.isValid()) {
    throw new Error('Offer is not valid');
  }
  
  if (this.usageLimit !== null && this.usedCount >= this.usageLimit) {
    throw new Error('Offer usage limit reached');
  }
  
  // Check if user already claimed this offer
  const alreadyClaimed = this.claimedBy.some(claim => claim.user.toString() === userId.toString());
  if (alreadyClaimed) {
    throw new Error('User already claimed this offer');
  }
  
  this.usedCount += 1;
  this.claimedBy.push({ user: userId });
  return this.save();
};

// Pre-save middleware to handle legacy fields
offerSchema.pre('save', function(next) {
  // If new fields are not set, try to populate from legacy fields
  if (!this.code && this.title) {
    this.code = this.title.replace(/\s+/g, '_').toUpperCase();
  }
  
  if (!this.discountValue && this.discount) {
    this.discountValue = this.discount;
    this.discountType = 'percentage';
  }
  
  if (!this.startDate && this.validFrom) {
    this.startDate = this.validFrom;
  }
  
  if (!this.endDate && this.validUntil) {
    this.endDate = this.validUntil;
  }
  
  if (!this.applicableProducts && this.productIds) {
    this.applicableProducts = this.productIds;
  }
  
  if (!this.usageLimit && this.maxUses !== -1) {
    this.usageLimit = this.maxUses;
  }

  // Ensure numeric fields are properly converted
  if (this.discountValue && typeof this.discountValue === 'string') {
    this.discountValue = parseFloat(this.discountValue);
  }
  
  if (this.minimumOrderAmount && typeof this.minimumOrderAmount === 'string') {
    this.minimumOrderAmount = parseFloat(this.minimumOrderAmount);
  }
  
  if (this.maximumDiscountAmount && typeof this.maximumDiscountAmount === 'string') {
    this.maximumDiscountAmount = parseFloat(this.maximumDiscountAmount);
  }
  
  if (this.usageLimit && typeof this.usageLimit === 'string') {
    this.usageLimit = parseInt(this.usageLimit);
  }
  
  next();
});

module.exports = mongoose.model('Offer', offerSchema); 