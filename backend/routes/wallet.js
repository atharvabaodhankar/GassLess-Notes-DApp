const express = require('express');
const { verifyFirebaseToken } = require('../middleware/auth');
const User = require('../models/User');
const blockchainService = require('../services/blockchain');

const router = express.Router();

/**
 * GET /api/wallet/info
 * Get wallet information for the authenticated user
 */
router.get('/info', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    const user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get additional wallet info from blockchain
    const walletInfo = await blockchainService.getWalletAddress(userId, user.walletSalt);

    res.json({
      success: true,
      wallet: {
        address: user.walletAddress,
        salt: user.walletSalt,
        ownerAddress: walletInfo.ownerAddress,
        createdAt: user.createdAt
      }
    });

  } catch (error) {
    console.error('Get wallet info error:', error);
    res.status(500).json({
      error: 'Failed to fetch wallet info',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/wallet/balance
 * Get wallet balance (if needed for gas estimation)
 */
router.get('/balance', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;

    const user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // In a gasless system, users don't need to worry about balance
    // But this endpoint can be useful for debugging or admin purposes
    res.json({
      success: true,
      balance: {
        eth: '0.0', // Users don't hold ETH in gasless system
        gasless: true,
        message: 'Gas fees are sponsored by the paymaster'
      }
    });

  } catch (error) {
    console.error('Get wallet balance error:', error);
    res.status(500).json({
      error: 'Failed to fetch wallet balance',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/wallet/transactions
 * Get transaction history for the user's wallet
 */
router.get('/transactions', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get notes with transaction info
    const Note = require('../models/Note');
    const skip = (page - 1) * limit;

    const transactions = await Note.find({ 
      userId: userId,
      transactionHash: { $ne: null }
    })
    .sort({ onChainTimestamp: -1 })
    .skip(skip)
    .limit(limit)
    .select('id title transactionHash blockNumber onChainTimestamp onChainStatus userOpHash');

    const total = await Note.countDocuments({ 
      userId: userId,
      transactionHash: { $ne: null }
    });

    res.json({
      success: true,
      transactions: transactions.map(tx => ({
        noteId: tx.id,
        noteTitle: tx.title,
        transactionHash: tx.transactionHash,
        userOpHash: tx.userOpHash,
        blockNumber: tx.blockNumber,
        status: tx.onChainStatus,
        timestamp: tx.onChainTimestamp,
        type: 'note_registration'
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get wallet transactions error:', error);
    res.status(500).json({
      error: 'Failed to fetch transactions',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * POST /api/wallet/check-status/:txHash
 * Check the status of a specific transaction
 */
router.get('/check-status/:txHash', verifyFirebaseToken, async (req, res) => {
  try {
    const { txHash } = req.params;
    const userId = req.user.uid;

    // Verify the transaction belongs to this user
    const Note = require('../models/Note');
    const note = await Note.findOne({ 
      userId: userId,
      $or: [
        { transactionHash: txHash },
        { userOpHash: txHash }
      ]
    });

    if (!note) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    // Check current status from blockchain
    let status;
    if (note.transactionHash) {
      status = await blockchainService.checkTransactionStatus(note.transactionHash);
    } else {
      status = { status: note.onChainStatus };
    }

    // Update note if status changed
    if (status.status !== note.onChainStatus) {
      await Note.findOneAndUpdate(
        { id: note.id },
        { 
          onChainStatus: status.status,
          blockNumber: status.blockNumber || note.blockNumber,
          onChainTimestamp: status.status === 'confirmed' ? new Date() : note.onChainTimestamp
        }
      );
    }

    res.json({
      success: true,
      transaction: {
        hash: txHash,
        status: status.status,
        blockNumber: status.blockNumber,
        gasUsed: status.gasUsed,
        noteId: note.id,
        noteTitle: note.title
      }
    });

  } catch (error) {
    console.error('Check transaction status error:', error);
    res.status(500).json({
      error: 'Failed to check transaction status',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

module.exports = router;