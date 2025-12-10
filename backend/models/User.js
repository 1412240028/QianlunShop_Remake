// =========================
// 👤 USER MODEL
// =========================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },
  
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters'],
    select: false // Don't return password by default
  },
  
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^(\+62|62|0)[0-9]{9,12}$/.test(v);
      },
      message: 'Please provide a valid Indonesian phone number'
    }
  },
  
  role: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  
  address: {
    street: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    postalCode: { 
      type: String, 
      trim: true,
      validate: {
        validator: function(v) {
          return !v || /^\d{5}$/.test(v);
        },
        message: 'Postal code must be 5 digits'
      }
    },
    country: { type: String, default: 'Indonesia', trim: true }
  },
  
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastLogin: {
    type: Date
  },
  
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  
}, {
  timestamps: true
});

// =========================
// 🔒 MIDDLEWARE: Hash password before saving
// =========================
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// =========================
// 🔐 METHOD: Compare password
// =========================
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// =========================
// 📊 METHOD: Get public profile
// =========================
userSchema.methods.getPublicProfile = function() {
  const user = this.toObject();
  delete user.password;
  delete user.resetPasswordToken;
  delete user.resetPasswordExpire;
  return user;
};

// =========================
// 🔍 INDEXES
// =========================
userSchema.index({ email: 1 });
userSchema.index({ createdAt: -1 });

module.exports = mongoose.model('User', userSchema);