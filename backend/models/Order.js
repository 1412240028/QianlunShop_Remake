// =========================
// 📦 ORDER MODEL
// =========================

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
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  image: {
    type: String
  }
}, { _id: false });

const shippingAddressSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required']
  },
  address: {
    type: String,
    required: [true, 'Address is required']
  },
  city: {
    type: String,
    required: [true, 'City is required']
  },
  postalCode: {
    type: String,
    required: [true, 'Postal code is required']
  },
  country: {
    type: String,
    default: 'Indonesia'
  }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  items: {
    type: [orderItemSchema],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'Order must have at least one item'
    }
  },
  
  shippingAddress: {
    type: shippingAddressSchema,
    required: true
  },
  
  paymentMethod: {
    type: String,
    required: [true, 'Payment method is required'],
    enum: ['creditCard', 'bankTransfer', 'ewallet', 'cod']
  },
  
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  
  shippingMethod: {
    type: String,
    enum: ['regular', 'express', 'same-day', 'free'],
    default: 'regular'
  },
  
  shippingCost: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  
  tax: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  
  discount: {
    type: Number,
    min: 0,
    default: 0
  },
  
  promoCode: {
    type: String,
    trim: true,
    uppercase: true
  },
  
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  trackingNumber: {
    type: String,
    trim: true
  },
  
  notes: {
    type: String,
    maxlength: 500
  },
  
  paidAt: {
    type: Date
  },
  
  shippedAt: {
    type: Date
  },
  
  deliveredAt: {
    type: Date
  },
  
  cancelledAt: {
    type: Date
  },
  
  cancellationReason: {
    type: String
  }
  
}, {
  timestamps: true
});

// =========================
// 🔧 MIDDLEWARE: Generate order number
// =========================
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const prefix = 'ORD';
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Count orders today to generate unique number
    const startOfDay = new Date(date.setHours(0, 0, 0, 0));
    const count = await this.constructor.countDocuments({
      createdAt: { $gte: startOfDay }
    });
    
    const sequence = String(count + 1).padStart(4, '0');
    this.orderNumber = `${prefix}-${year}${month}${day}-${sequence}`;
  }
  next();
});

// =========================
// 📊 METHOD: Calculate totals
// =========================
orderSchema.methods.calculateTotals = function() {
  // Calculate subtotal
  this.subtotal = this.items.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);
  
  // Calculate tax (11% PPN)
  this.tax = Math.round(this.subtotal * 0.11);
  
  // Calculate total
  this.totalAmount = this.subtotal + this.tax + this.shippingCost - this.discount;
  
  return this;
};

// =========================
// 📊 METHOD: Update status
// =========================
orderSchema.methods.updateStatus = async function(newStatus) {
  this.status = newStatus;
  
  switch (newStatus) {
    case 'shipped':
      this.shippedAt = new Date();
      break;
    case 'delivered':
      this.deliveredAt = new Date();
      break;
    case 'cancelled':
      this.cancelledAt = new Date();
      break;
  }
  
  await this.save();
  return this;
};

// =========================
// 📊 METHOD: Update payment status
// =========================
orderSchema.methods.updatePaymentStatus = async function(newStatus) {
  this.paymentStatus = newStatus;
  
  if (newStatus === 'paid') {
    this.paidAt = new Date();
    
    // Auto-update order status to processing
    if (this.status === 'pending') {
      this.status = 'processing';
    }
  }
  
  await this.save();
  return this;
};

// =========================
// 🔍 INDEXES
// =========================
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderNumber: 1 }, { unique: true });
orderSchema.index({ status: 1 });
orderSchema.index({ paymentStatus: 1 });
orderSchema.index({ createdAt: -1 });

// =========================
// 🔍 STATIC: Get user orders
// =========================
orderSchema.statics.getUserOrders = function(userId, options = {}) {
  const { page = 1, limit = 10, status } = options;
  const skip = (page - 1) * limit;
  
  const query = { user: userId };
  if (status) {
    query.status = status;
  }
  
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('items.product', 'name slug images');
};

module.exports = mongoose.model('Order', orderSchema);