const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Gasless Notes Backend - Firebase Only',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Blockchain endpoints (for future integration)
app.get('/api/blockchain/status', (req, res) => {
  res.json({
    status: 'ready',
    message: 'Blockchain service ready for integration',
    contracts: {
      entryPoint: process.env.ENTRY_POINT_ADDRESS,
      accountFactory: process.env.ACCOUNT_FACTORY_ADDRESS,
      notesRegistry: process.env.NOTES_REGISTRY_ADDRESS,
      paymaster: process.env.PAYMASTER_ADDRESS
    }
  });
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
    message: 'This backend is for blockchain operations only. Use Firebase for data operations.'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Gasless Notes Backend (Firebase-Only) running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🔥 Main app uses Firebase directly - this backend is for future blockchain integration`);
});