const express = require('express');
const router = express.Router();

// ==========================================
// 🔐 AUTHENTICATION ROUTES
// ==========================================

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Mock authentication
    if (email === 'admin@qianlunshop.com' && password === 'password123') {
      const token = 'mock_jwt_token_' + Date.now();

      res.json({
        success: true,
        data: {
          user: {
            _id: 'user_123',
            name: 'Admin User',
            email: 'admin@qianlunshop.com',
            role: 'admin'
          },
          token
        },
        message: 'Login successful'
      });
    } else if (email === 'user@qianlunshop.com' && password === 'password123') {
      const token = 'mock_jwt_token_' + Date.now();

      res.json({
        success: true,
        data: {
          user: {
            _id: 'user_456',
            name: 'John Doe',
            email: 'user@qianlunshop.com',
            role: 'customer'
          },
          token
        },
        message: 'Login successful'
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed'
    });
  }
});

// @route   POST /api/auth/register
// @desc    Register new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Mock registration
    const token = 'mock_jwt_token_' + Date.now();

    res.status(201).json({
      success: true,
      data: {
        user: {
          _id: 'user_' + Date.now(),
          name,
          email,
          role: 'customer'
        },
        token
      },
      message: 'Registration successful'
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed'
    });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Logout failed'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
  try {
    // Mock current user
    const user = {
      _id: 'user_123',
      name: 'John Doe',
      email: 'user@qianlunshop.com',
      role: 'customer'
    };

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user'
    });
  }
});

module.exports = router;
