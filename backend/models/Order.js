const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Order must belong to a user']
  },
  items: [{
    product: {
      type: mongoose.Schema.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    image: String,
    attributes: {
      color: String,
      size: String
    }
  }],
  shippingAddress: {
    name: {
      type: String,
      required: [true, 'Please provide recipient name']
    },
    phone: {
      type: String,
      required: [true, 'Please provide phone number']
    },
    email: String,
    address: {
      type: String,
      required: [true, 'Please provide address']
    },
    city: {
      type: String,
      required: [true, 'Please provide city']
    },
    state: String,
    zipCode: {
      type: String,
      required: [true, 'Please provide zip code']
    },
    country: {
      type: String,
      required: [true, 'Please provide country'],
      default: 'Indonesia'
    }
  },
  paymentMethod: {
    type: String,
    required: [true, 'Please provide payment method'],
    enum: {
      values: ['midtrans', 'bank_transfer', 'cod'],
      message: 'Payment method must be midtrans, bank_transfer, or cod'
    }
  },
  paymentDetails: {
    midtransOrderId: String,
    midtransTransactionId: String,
    paymentType: String,
    transactionStatus: {
      type: String,
      enum: ['pending', 'settlement', 'cancel', 'expire', 'failure'],
      default: 'pending'
    },
    fraudStatus: String,
    paymentDate: Date
  },
  orderNumber: {
    type: String,
    unique: true
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      message: 'Status must be pending, confirmed, processing, shipped, delivered, cancelled, or refunded'
    },
    default: 'pending'
  },
  paymentStatus: {
    type: String,
    enum: {
      values: ['pending', 'paid', 'failed', 'refunded'],
      message: 'Payment status must be pending, paid, failed, or refunded'
    },
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  shippingCost: {
    type: Number,
    default: 0,
    min: 0
  },
  discountAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'IDR',
    enum: ['IDR', 'USD']
  },
  notes: String,
  trackingNumber: String,
  estimatedDelivery: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancelReason: String,
  refundAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  refundReason: String,
  refundedAt: Date
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ 'paymentDetails.transactionStatus': 1 });

// Virtual for order age in days
orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    this.orderNumber = `QL${timestamp}${random}`;
  }
  next();
});

// Static method to get orders by status
orderSchema.statics.getByStatus = function(status, limit = 50) {
  return this.find({ status })
    .populate('user', 'name email')
    .populate('items.product', 'name images price')
    .limit(limit)
    .sort({ createdAt: -1 });
};

// Instance method to calculate totals
orderSchema.methods.calculateTotals = function() {
  this.subtotal = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  // Calculate tax (11% for Indonesia)
  this.taxAmount = Math.round(this.subtotal * 0.11);

  // Calculate shipping (free for orders over 500k, otherwise 25k)
  this.shippingCost = this.subtotal >= 500000 ? 0 : 25000;

  // Apply discount if any
  this.totalAmount = this.subtotal + this.taxAmount + this.shippingCost - this.discountAmount;

  return this.save();
};

// Instance method to update status
orderSchema.methods.updateStatus = function(newStatus, notes = '') {
  const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'];

  if (!validStatuses.includes(newStatus)) {
    throw new Error('Invalid status');
  }

  this.status = newStatus;

  if (newStatus === 'delivered') {
    this.deliveredAt = new Date();
  } else if (newStatus === 'cancelled') {
    this.cancelledAt = new Date();
    this.cancelReason = notes;
  } else if (newStatus === 'refunded') {
    this.refundedAt = new Date();
    this.refundReason = notes;
  }

  return this.save();
};

module.exports = mongoose.model('Order', orderSchema);
