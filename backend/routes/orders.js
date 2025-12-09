const express = require('express');
const router = express.Router();

// ==========================================
// 📦 ORDERS ROUTES
// ==========================================

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get('/', async (req, res) => {
  try {
    // Mock orders data
    const orders = [
      {
        _id: 'order_001',
        user: 'user_123',
        items: [
          {
            product: '1',
            name: 'QianLun Watch',
            price: 299000,
            quantity: 1,
            image: '/assets/images/products/QianLun Watch.jpg'
          }
        ],
        totalAmount: 299000,
        status: 'completed',
        paymentStatus: 'paid',
        shippingAddress: {
          name: 'John Doe',
          address: 'Jl. Sudirman No. 123',
          city: 'Jakarta',
          postalCode: '12345'
        },
        createdAt: new Date().toISOString()
      }
    ];

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders'
    });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;

    // Mock order creation
    const order = {
      _id: `order_${Date.now()}`,
      user: 'user_123',
      items,
      totalAmount: items.reduce((total, item) => total + (item.price * item.quantity), 0),
      status: 'pending',
      paymentStatus: 'pending',
      shippingAddress,
      paymentMethod,
      createdAt: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      data: order,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order'
    });
  }
});

module.exports = router;
