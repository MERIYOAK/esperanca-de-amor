const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Quantity must be at least 1']
  },
  total: {
    type: Number,
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
    phone: String
  },
  paymentMethod: {
    type: String,
    enum: ['cash_on_delivery', 'bank_transfer', 'mobile_money'],
    default: 'cash_on_delivery'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  whatsappMessage: {
    type: String,
    default: null
  },
  whatsappSent: {
    type: Boolean,
    default: false
  },
  whatsappSentAt: {
    type: Date,
    default: null
  },
  estimatedDelivery: {
    type: Date,
    default: null
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  cancelledAt: {
    type: Date,
    default: null
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  cancellationReason: {
    type: String,
    maxlength: [200, 'Cancellation reason cannot be more than 200 characters']
  }
}, {
  timestamps: true
});

// Indexes for better query performance (orderNumber index is automatically created by unique: true)
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ paymentStatus: 1 });

// Pre-save middleware to generate order number
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Get count of orders for today
    const todayOrders = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        $lt: new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
      }
    });
    
    this.orderNumber = `EA${year}${month}${day}${String(todayOrders + 1).padStart(4, '0')}`;
  }
  next();
});

// Method to update order status
orderSchema.methods.updateStatus = function(newStatus, updatedBy = null) {
  this.status = newStatus;
  
  if (newStatus === 'delivered') {
    this.deliveredAt = new Date();
  } else if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
    this.cancelledBy = updatedBy;
  }
  
  return this.save();
};

// Method to generate WhatsApp message
orderSchema.methods.generateWhatsAppMessage = function() {
  const itemsList = this.items.map(item => 
    `• ${item.name} - ${item.quantity}x ${item.price.toLocaleString()} Kz`
  ).join('\n');
  
  const message = `${process.env.WHATSAPP_MESSAGE_TEMPLATE || 'Hello! I would like to place an order for the following items:'}\n\n${itemsList}\n\nOrder Number: ${this.orderNumber}\nTotal Amount: ${this.totalAmount.toLocaleString()} Kz\n\nCustomer: ${this.user.name || 'N/A'}\nPhone: ${this.shippingAddress.phone || 'N/A'}\nAddress: ${this.shippingAddress.street}, ${this.shippingAddress.city}`;
  
  this.whatsappMessage = message;
  return this.save();
};

// Method to mark WhatsApp as sent
orderSchema.methods.markWhatsAppSent = function() {
  this.whatsappSent = true;
  this.whatsappSentAt = new Date();
  return this.save();
};

// Virtual for order status color
orderSchema.virtual('statusColor').get(function() {
  const colors = {
    pending: 'yellow',
    confirmed: 'blue',
    processing: 'orange',
    shipped: 'purple',
    delivered: 'green',
    cancelled: 'red'
  };
  return colors[this.status] || 'gray';
});

// Ensure virtual fields are serialized
orderSchema.set('toJSON', { virtuals: true });
orderSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Order', orderSchema); 