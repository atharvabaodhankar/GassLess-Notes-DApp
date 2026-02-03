const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import blockchain service
const blockchainService = require('./services/blockchain');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Gasless Notes Backend - Real Blockchain Integration',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Blockchain status endpoint
app.get('/api/blockchain/status', async (req, res) => {
  try {
    const networkInfo = await blockchainService.getNetworkInfo();
    res.json({
      status: 'ready',
      message: 'Blockchain service connected to Sepolia',
      network: networkInfo,
      contracts: {
        entryPoint: process.env.ENTRY_POINT_ADDRESS,
        accountFactory: process.env.ACCOUNT_FACTORY_ADDRESS,
        notesRegistry: process.env.NOTES_REGISTRY_ADDRESS,
        paymaster: process.env.PAYMASTER_ADDRESS
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to connect to blockchain',
      error: error.message
    });
  }
});

// Get wallet address for user
app.post('/api/wallet/address', async (req, res) => {
  try {
    const { userUid } = req.body;
    
    if (!userUid) {
      return res.status(400).json({ error: 'userUid is required' });
    }
    
    const walletInfo = await blockchainService.getWalletAddress(userUid);
    res.json(walletInfo);
  } catch (error) {
    console.error('Error getting wallet address:', error);
    res.status(500).json({ error: error.message });
  }
});

// Register note on blockchain
app.post('/api/notes/register', async (req, res) => {
  try {
    const { noteId, noteHash, userUid } = req.body;
    
    if (!noteId || !noteHash || !userUid) {
      return res.status(400).json({ 
        error: 'noteId, noteHash, and userUid are required' 
      });
    }
    
    console.log(`📝 Registering note ${noteId} for user ${userUid}`);
    
    const result = await blockchainService.registerNoteOnChain(noteId, noteHash, userUid);
    res.json(result);
  } catch (error) {
    console.error('Error registering note:', error);
    res.status(500).json({ 
      status: 'failed',
      error: error.message 
    });
  }
});

// Check transaction status
app.get('/api/transaction/:hash', async (req, res) => {
  try {
    const { hash } = req.params;
    
    if (!hash) {
      return res.status(400).json({ error: 'Transaction hash is required' });
    }
    
    const status = await blockchainService.checkTransactionStatus(hash);
    res.json(status);
  } catch (error) {
    console.error('Error checking transaction status:', error);
    res.status(500).json({ error: error.message });
  }
});

// Verify note on blockchain
app.post('/api/notes/verify', async (req, res) => {
  try {
    const { noteId, expectedHash } = req.body;
    
    if (!noteId || !expectedHash) {
      return res.status(400).json({ 
        error: 'noteId and expectedHash are required' 
      });
    }
    
    const verification = await blockchainService.verifyNoteOnChain(noteId, expectedHash);
    res.json(verification);
  } catch (error) {
    console.error('Error verifying note:', error);
    res.status(500).json({ error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    message: 'Available endpoints: /health, /api/blockchain/status, /api/wallet/address, /api/notes/register, /api/notes/verify'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Gasless Notes Backend (Real Blockchain) running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`⛓️  Connected to Sepolia blockchain`);
  console.log(`📍 Available endpoints:`);
  console.log(`   GET  /health`);
  console.log(`   GET  /api/blockchain/status`);
  console.log(`   POST /api/wallet/address`);
  console.log(`   POST /api/notes/register`);
  console.log(`   POST /api/notes/verify`);
  console.log(`   GET  /api/transaction/:hash`);
});