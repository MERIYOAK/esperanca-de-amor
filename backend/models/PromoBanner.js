const mongoose = require('mongoose');

const promoBannerSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Banner text is required'],
    trim: true,
    maxlength: [200, 'Banner text cannot be more than 200 characters']
  },
  icon: {
    type: String,
    required: [true, 'Icon is required'],
    enum: {
      values: ['Gift', 'Truck', 'Heart', 'Percent', 'Clock', 'ShoppingBag', 'Star', 'Tag', 'Award'],
      message: 'Invalid icon. Please select a valid icon from the list.'
    }
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
    enum: {
      values: [
        'from-red-600 to-red-700',
        'from-orange-600 to-orange-700', 
        'from-yellow-600 to-yellow-700',
        'from-green-600 to-green-700',
        'from-blue-600 to-blue-700',
        'from-indigo-600 to-indigo-700',
        'from-purple-600 to-purple-700'
      ],
      message: 'Invalid color. Please select a valid color from the list.'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    default: function() {
      const date = new Date();
      date.setFullYear(date.getFullYear() + 1); // Default to 1 year from now
      return date;
    }
  }
}, {
  timestamps: true
});

// Index for active banners
promoBannerSchema.index({ isActive: 1, startDate: 1, endDate: 1 });

// Method to check if banner is currently active
promoBannerSchema.methods.isCurrentlyActive = function() {
  const now = new Date();
  return this.isActive && 
         now >= this.startDate && 
         now <= this.endDate;
};

module.exports = mongoose.model('PromoBanner', promoBannerSchema); 