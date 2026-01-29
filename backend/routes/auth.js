const express = require('express');
const { verifyFirebaseToken } = require('../middleware/auth');
const User = require('../models/User');
const blockchainService = require('../services/blockchain');

const router = express.Router();

/**
 * POST /api/auth/login
 * Handle user login and wallet creation
 */
router.post('/login', verifyFirebaseToken, async (req, res) => {
  try {
    const { uid, email } = req.user;

    // Check if user already exists
    let user = await User.findOne({ firebaseUid: uid });

    if (!user) {
      // Create new user and associated wallet
      console.log(`Creating new user for ${email}`);
      
      // Get wallet address for this user
      const walletInfo = await blockchainService.getWalletAddress(uid);
      
      user = new User({
        firebaseUid: uid,
        email: email,
        walletAddress: walletInfo.walletAddress,
        walletSalt: walletInfo.salt
      });

      await user.save();
      console.log(`✅ Created user with wallet: ${walletInfo.walletAddress}`);
    } else {
      // Update last login
      user.lastLoginAt = new Date();
      await user.save();
    }

    res.json({
      success: true,
      user: {
        uid: user.firebaseUid,
        email: user.email,
        walletAddress: user.walletAddress,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/auth/profile
 * Get user profile information
 */
router.get('/profile', verifyFirebaseToken, async (req, res) => {
  try {
    const user = await User.findOne({ firebaseUid: req.user.uid });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        uid: user.firebaseUid,
        email: user.email,
        walletAddress: user.walletAddress,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch profile',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/auth/logout
 * Handle user logout
 */
router.post('/logout', verifyFirebaseToken, async (req, res) => {
  try {
    // In a more complex app, you might invalidate sessions here
    res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      error: 'Logout failed',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;