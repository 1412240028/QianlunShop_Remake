const mongoose = require('mongoose');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
require('dotenv').config();

// ==========================================
// 🌱 DATABASE SEEDER
// ==========================================

const users = [
  {
    name: 'Admin User',
    email: 'admin@qianlunshop.com',
    password: 'admin123',
    role: 'admin',
    phone: '+6281234567890',
    address: {
      street: 'Jl. Admin No. 1',
      city: 'Jakarta',
      zipCode: '12345',
      country: 'Indonesia'
    }
  },
  {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    role: 'customer',
    phone: '+6281234567891',
    address: {
      street: 'Jl. Sudirman No. 123',
      city: 'Jakarta',
      zipCode: '12345',
      country: 'Indonesia'
    }
  },
  {
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: 'password123',
    role: 'customer',
    phone: '+6281234567892',
    address: {
      street: 'Jl. Thamrin No. 456',
      city: 'Jakarta',
      zipCode: '12346',
      country: 'Indonesia'
    }
  }
];

const products = [
  {
    name: 'QianLun Luxury Watch',
    description: 'Elegant luxury watch with premium materials and Swiss movement. Perfect for formal occasions and everyday wear.',
    price: 299000,
    originalPrice: 350000,
    category: 'watch',
    stock: 25,
    images: ['/assets/images/products/QianLun Watch.jpg'],
    isActive: true,
    attributes: {
      brand: 'QianLun',
      material: 'Stainless Steel',
      dialColor: 'Black',
      strapType: 'Leather',
      waterResistance: '50M'
    }
  },
  {
    name: 'QianLun Designer Bag',
    description: 'Stylish designer bag made from genuine leather. Spacious interior with multiple compartments for daily use.',
    price: 450000,
    category: 'bag',
    stock: 15,
    images: ['/assets/images/products/QianLun Bag.jpg'],
    isActive: true,
    attributes: {
      brand: 'QianLun',
      material: 'Genuine Leather',
      color: 'Brown',
      capacity: '25L',
      compartments: 5
    }
  },
  {
    name: 'QianLun Premium Wallet',
    description: 'Premium wallet crafted from high-quality leather with RFID protection. Multiple card slots and coin pocket.',
    price: 150000,
    category: 'wallet',
    stock: 40,
    images: ['/assets/images/products/QianLun Wallet.jpg'],
    isActive: true,
    attributes: {
      brand: 'QianLun',
      material: 'Premium Leather',
      color: 'Black',
      cardSlots: 8,
      rfidProtection: true
    }
  },
  {
    name: 'QianLun Running Shoes',
    description: 'High-performance running shoes with advanced cushioning technology. Perfect for athletes and fitness enthusiasts.',
    price: 350000,
    category: 'shoes',
    stock: 30,
    images: ['/assets/images/products/QianLun Shoes.jpg'],
    isActive: true,
    attributes: {
      brand: 'QianLun',
      material: 'Mesh',
      color: 'Blue',
      size: '42-45',
      technology: 'Air Cushion'
    }
  }
];

// Connect to database
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

// Import data
const importData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();

    // Insert users
    const createdUsers = await User.create(users);
    console.log('✅ Users imported');

    // Insert products
    const createdProducts = await Product.create(products);
    console.log('✅ Products imported');

    // Create sample orders
    const sampleOrders = [
      {
        user: createdUsers[1]._id, // John Doe
        items: [
          {
            product: createdProducts[0]._id, // Watch
            name: createdProducts[0].name,
            price: createdProducts[0].price,
            quantity: 1,
            image: createdProducts[0].images[0]
          }
        ],
        shippingAddress: createdUsers[1].address,
        paymentMethod: 'midtrans',
        subtotal: createdProducts[0].price,
        taxAmount: Math.round(createdProducts[0].price * 0.11),
        shippingCost: 0, // Free shipping over 500k
        totalAmount: createdProducts[0].price + Math.round(createdProducts[0].price * 0.11),
        status: 'delivered',
        paymentStatus: 'paid'
      },
      {
        user: createdUsers[2]._id, // Jane Smith
        items: [
          {
            product: createdProducts[1]._id, // Bag
            name: createdProducts[1].name,
            price: createdProducts[1].price,
            quantity: 1,
            image: createdProducts[1].images[0]
          },
          {
            product: createdProducts[2]._id, // Wallet
            name: createdProducts[2].name,
            price: createdProducts[2].price,
            quantity: 1,
            image: createdProducts[2].images[0]
          }
        ],
        shippingAddress: createdUsers[2].address,
        paymentMethod: 'bank_transfer',
        subtotal: createdProducts[1].price + createdProducts[2].price,
        taxAmount: Math.round((createdProducts[1].price + createdProducts[2].price) * 0.11),
        shippingCost: 0,
        totalAmount: (createdProducts[1].price + createdProducts[2].price) + Math.round((createdProducts[1].price + createdProducts[2].price) * 0.11),
        status: 'processing',
        paymentStatus: 'paid'
      }
    ];

    await Order.create(sampleOrders);
    console.log('✅ Sample orders imported');

    console.log('🎉 Data Import Success!');
    process.exit();
  } catch (error) {
    console.error('❌ Data Import Error:', error);
    process.exit(1);
  }
};

// Delete data
const deleteData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();

    console.log('🗑️  Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error('❌ Data Destroy Error:', error);
    process.exit(1);
  }
};

// Run based on command line arguments
if (process.argv[2] === '-d') {
  deleteData();
} else {
  importData();
}
