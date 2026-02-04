const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

// Load environment variables
dotenv.config();

// Import blockchain service
const blockchainService = require('./services/blockchain');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for API
  crossOriginEmbedderPolicy: false
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'production' ? 100 : 1000),
  message: {
    error: 'Too many requests from this IP, please try again later.',
    retryAfter: Math.ceil((parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000) / 60000) + ' minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  }
});

// Blockchain operations rate limiting (more restrictive)
const blockchainLimiter = rateLimit({
  windowMs: parseInt(process.env.BLOCKCHAIN_RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000, // 5 minutes default
  max: parseInt(process.env.BLOCKCHAIN_RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'production' ? 10 : 50),
  message: {
    error: 'Too many blockchain requests, please wait before trying again.',
    retryAfter: Math.ceil((parseInt(process.env.BLOCKCHAIN_RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000) / 60000) + ' minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

// CORS Configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : ['http://localhost:5174', 'http://localhost:5173', 'http://localhost:3000'];
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: process.env.CORS_CREDENTIALS === 'true',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization',
    'Cache-Control',
    'X-Access-Token'
  ],
  exposedHeaders: ['X-Total-Count', 'X-RateLimit-Limit', 'X-RateLimit-Remaining'],
  maxAge: 86400 // 24 hours
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const origin = req.get('Origin') || 'No Origin';
  const userAgent = req.get('User-Agent') || 'No User-Agent';
  console.log(`${timestamp} - ${req.method} ${req.path} - Origin: ${origin} - UA: ${userAgent.slice(0, 50)}`);
  next();
});

// Additional security headers middleware
app.use((req, res, next) => {
  res.header('X-Content-Type-Options', 'nosniff');
  res.header('X-Frame-Options', 'DENY');
  res.header('X-XSS-Protection', '1; mode=block');
  res.header('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  if (process.env.NODE_ENV === 'production') {
    res.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Gasless Notes Backend - Real Blockchain Integration',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    cors: {
      allowedOrigins: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : ['http://localhost:5174', 'http://localhost:5173'],
      credentials: process.env.CORS_CREDENTIALS === 'true'
    },
    rateLimits: {
      general: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'production' ? 100 : 1000)
      },
      blockchain: {
        windowMs: parseInt(process.env.BLOCKCHAIN_RATE_LIMIT_WINDOW_MS) || 5 * 60 * 1000,
        maxRequests: parseInt(process.env.BLOCKCHAIN_RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'production' ? 10 : 50)
      }
    }
  });
});

// CORS preflight handler
app.options('*', cors(corsOptions));

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
app.post('/api/wallet/address', blockchainLimiter, async (req, res) => {
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
app.post('/api/notes/register', blockchainLimiter, async (req, res) => {
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
app.post('/api/notes/verify', blockchainLimiter, async (req, res) => {
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
  console.log(`🛡️  Security features enabled:`);
  console.log(`   • CORS: ${process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').join(', ') : 'Default origins'}`);
  console.log(`   • Rate Limiting: ${parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'production' ? 100 : 1000)} req/15min`);
  console.log(`   • Blockchain Rate Limiting: ${parseInt(process.env.BLOCKCHAIN_RATE_LIMIT_MAX_REQUESTS) || (process.env.NODE_ENV === 'production' ? 10 : 50)} req/5min`);
  console.log(`   • Helmet Security Headers: Enabled`);
  console.log(`   • Request Logging: Enabled`);
  console.log(`📍 Available endpoints:`);
  console.log(`   GET  /health`);
  console.log(`   GET  /api/blockchain/status`);
  console.log(`   POST /api/wallet/address`);
  console.log(`   POST /api/notes/register`);
  console.log(`   POST /api/notes/verify`);
  console.log(`   GET  /api/transaction/:hash`);
});