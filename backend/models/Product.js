// =========================
// 📦 PRODUCT MODEL
// =========================

const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    minlength: [3, 'Product name must be at least 3 characters'],
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  
  slug: {
    type: String,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  description: {
    type: String,
    required: [true, 'Product description is required'],
    minlength: [10, 'Description must be at least 10 characters'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative'],
    validate: {
      validator: Number.isFinite,
      message: 'Price must be a valid number'
    }
  },
  
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  
  discount: {
    type: Number,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%'],
    default: 0
  },
  
  category: {
    type: String,
    required: [true, 'Product category is required'],
    enum: ['watch', 'bag', 'shoes', 'wallet', 'accessories'],
    lowercase: true
  },
  
  brand: {
    type: String,
    trim: true,
    default: 'QianlunLux'
  },
  
  images: {
    type: [String],
    validate: {
      validator: function(v) {
        return v && v.length > 0;
      },
      message: 'At least one product image is required'
    }
  },
  
  thumbnail: {
    type: String
  },
  
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  
  rating: {
    type: Number,
    min: [0, 'Rating cannot be negative'],
    max: [5, 'Rating cannot exceed 5'],
    default: 0
  },
  
  reviewCount: {
    type: Number,
    min: [0, 'Review count cannot be negative'],
    default: 0
  },
  
  isNew: {
    type: Boolean,
    default: false
  },
  
  isFeatured: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  specifications: {
    type: Map,
    of: String
  },
  
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  
  variants: [{
    name: { type: String, required: true },
    value: { type: String, required: true },
    inStock: { type: Boolean, default: true }
  }],
  
  soldCount: {
    type: Number,
    default: 0,
    min: [0, 'Sold count cannot be negative']
  }
  
}, {
  timestamps: true
});

// =========================
// 🔧 MIDDLEWARE: Generate slug from name
// =========================
productSchema.pre('save', async function(next) {
  if (this.isModified('name')) {
    // Generate slug from name
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    // Ensure slug is unique
    const existingProduct = await this.constructor.findOne({ 
      slug: this.slug,
      _id: { $ne: this._id }
    });
    
    if (existingProduct) {
      this.slug = `${this.slug}-${Date.now()}`;
    }
  }
  
  // Set thumbnail to first image if not set
  if (!this.thumbnail && this.images && this.images.length > 0) {
    this.thumbnail = this.images[0];
  }
  
  // Calculate discount if originalPrice is set
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discount = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  
  next();
});

// =========================
// 📊 VIRTUAL: In stock status
// =========================
productSchema.virtual('inStock').get(function() {
  return this.stock > 0;
});

// =========================
// 📊 METHOD: Update stock
// =========================
productSchema.methods.updateStock = async function(quantity, operation = 'decrease') {
  if (operation === 'decrease') {
    if (this.stock < quantity) {
      throw new Error('Insufficient stock');
    }
    this.stock -= quantity;
    this.soldCount += quantity;
  } else if (operation === 'increase') {
    this.stock += quantity;
  }
  
  await this.save();
  return this;
};

// =========================
// 📊 METHOD: Update rating
// =========================
productSchema.methods.updateRating = async function(newRating) {
  const totalRating = this.rating * this.reviewCount + newRating;
  this.reviewCount += 1;
  this.rating = totalRating / this.reviewCount;
  
  await this.save();
  return this;
};

// =========================
// 🔍 INDEXES
// =========================
productSchema.index({ slug: 1 }, { unique: true });
productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ price: 1 });
productSchema.index({ rating: -1 });
productSchema.index({ soldCount: -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ name: 'text', description: 'text' });

// =========================
// 🔍 STATIC: Search products
// =========================
productSchema.statics.searchProducts = function(query) {
  return this.find(
    { $text: { $search: query }, isActive: true },
    { score: { $meta: 'textScore' } }
  ).sort({ score: { $meta: 'textScore' } });
};

module.exports = mongoose.model('Product', productSchema);