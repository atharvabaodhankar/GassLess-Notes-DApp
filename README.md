# 🚀 Gasless Notes DApp

**Web2-like UX meets Web3 Security** - A revolutionary notes application powered by ERC-4337 Account Abstraction on Ethereum Sepolia.

![Gasless Notes](https://img.shields.io/badge/ERC--4337-Account%20Abstraction-blue)
![Sepolia](https://img.shields.io/badge/Network-Sepolia%20Testnet-green)
![Firebase](https://img.shields.io/badge/Database-Firebase%20Firestore-orange)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61dafb)

## 🎯 **What Makes This Special**

- **🔥 Zero Gas Fees**: Users never pay gas - our paymaster sponsors all transactions
- **⚡ Instant UX**: Notes save immediately, blockchain verification happens in background
- **🔐 Cryptographic Security**: Every note is hash-verified on Ethereum blockchain
- **🎨 Modern UI**: Dark ChatGPT-inspired interface with Tailwind CSS
- **🔑 Web2 Login**: Simple Firebase Auth - no MetaMask required
- **🛡️ Account Abstraction**: Each user gets a smart contract wallet automatically

## 🏗️ **Architecture Overview**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Blockchain    │
│   React + Vite  │◄──►│  Node.js + API  │◄──►│ Sepolia + ERC-4337│
│                 │    │                 │    │                 │
│ • Firebase Auth │    │ • Ethers.js     │    │ • Smart Wallets │
│ • Firestore DB  │    │ • Contract APIs │    │ • Notes Registry│
│ • Real-time UI  │    │ • Gas Management│    │ • Paymaster     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+ and npm
- Git

### **1. Clone & Install**
```bash
git clone https://github.com/atharvabaodhankar/GassLess-Notes-DApp.git
cd GassLess-Notes-DApp

# Install all dependencies
npm install
cd frontend && npm install
cd ../backend && npm install
cd ../hardhat && npm install
```

### **2. Environment Setup**

**Backend (.env)**
```bash
cd backend
cp .env.example .env
# Edit .env with your values:
# - RPC_URL: Your Alchemy Sepolia endpoint
# - PRIVATE_KEY: Deployer wallet private key (with 0x prefix)
# - Contract addresses (provided after deployment)
```

**Frontend (.env)**
```bash
cd frontend
# Create .env with Firebase config:
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_PROJECT_ID=your_project_id
# ... other Firebase config
```

### **3. Deploy Contracts (Optional)**
```bash
cd hardhat
npm run deploy:sepolia
# Contracts are already deployed, but you can deploy your own
```

### **4. Start the Application**

**Terminal 1 - Backend:**
```bash
cd backend
npm start
# Runs on http://localhost:3001
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Runs on http://localhost:5174
```

### **5. Use the App**
1. Open http://localhost:5174
2. Sign in with Google (Firebase Auth)
3. Create notes instantly - they save immediately
4. Watch blockchain verification happen in background
5. All gas fees are sponsored automatically!

## 📋 **Features**

### **Core Functionality**
- ✅ **Create Notes**: Instant save with background blockchain verification
- ✅ **Edit Notes**: Update content with automatic re-verification
- ✅ **Delete Notes**: Remove notes from both Firebase and blockchain
- ✅ **Real-time Sync**: Live updates across all devices
- ✅ **Status Tracking**: See pending/confirmed/failed blockchain states

### **Blockchain Features**
- ✅ **ERC-4337 Integration**: Smart contract wallets for each user
- ✅ **Gasless Transactions**: Paymaster sponsors all gas fees
- ✅ **Content Integrity**: SHA256 hashes stored on-chain
- ✅ **Verification System**: Cryptographic proof of note authenticity
- ✅ **Transaction History**: View all blockchain interactions

### **User Experience**
- ✅ **Web2-like Login**: Google OAuth via Firebase
- ✅ **Instant Feedback**: No waiting for blockchain confirmations
- ✅ **Dark Theme**: Professional ChatGPT-inspired UI
- ✅ **Responsive Design**: Works on desktop and mobile
- ✅ **Status Refresh**: Manual refresh for pending notes

## 🔧 **Technical Stack**

### **Frontend**
- **React 18** with Vite for fast development
- **Tailwind CSS** for styling with custom dark theme
- **Firebase SDK** for authentication and Firestore
- **React Hot Toast** for notifications
- **Material Symbols** for icons

### **Backend**
- **Node.js + Express** for API server
- **Ethers.js v5** for blockchain interactions
- **Firebase Admin** for user verification
- **CORS enabled** for cross-origin requests

### **Blockchain**
- **Ethereum Sepolia** testnet
- **ERC-4337** Account Abstraction standard
- **Solidity 0.8.19** smart contracts
- **Hardhat** for development and deployment
- **Alchemy** RPC provider

### **Smart Contracts**
```solidity
// Deployed on Sepolia Testnet
EntryPoint:      0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789 (Canonical)
AccountFactory:  0x34E676A2307ad597547d5dABFA466264dBb739C6
NotesRegistry:   0x14f3dfddab66f0E2C14d46415bc635b3a363EeDf
Paymaster:       0x9D18bDD3E47990e4da201936A1433dB8eB53DA3b (0.4 ETH funded)
```

## 🔐 **Security Features**

### **Authentication & Authorization**
- Firebase Authentication with Google OAuth
- JWT token verification on backend
- User-specific data isolation
- Secure API endpoints with CORS

### **Blockchain Security**
- Deterministic wallet generation per user
- Private key management (server-side only)
- Content hash verification (SHA256)
- Replay attack prevention via nonces
- Gas limit controls and rate limiting ready

### **Data Protection**
- Client-side input validation
- Server-side parameter sanitization
- Firebase security rules (recommended)
- Environment variable protection

## 💰 **Paymaster Management**

The paymaster sponsors all gas fees for users. Current status:

- **Balance**: 0.4 ETH (~200 transactions)
- **Auto-funding**: Enabled when balance < 0.05 ETH
- **Status**: Production ready

### **Paymaster Commands**
```bash
# Check paymaster status
npm run paymaster:check

# Quick balance check
npm run paymaster:balance

# Fund paymaster (to 0.4 ETH target)
npm run paymaster:fund

# Start monitoring
npm run paymaster:monitor
```

## 📊 **API Endpoints**

### **Backend API (Port 3001)**
```
GET  /health                    # Service health check
GET  /api/blockchain/status     # Network and contract status
POST /api/wallet/address        # Get user's smart wallet address
POST /api/notes/register        # Register note on blockchain
POST /api/notes/verify          # Verify note integrity
GET  /api/transaction/:hash     # Check transaction status
```

### **Example API Usage**
```javascript
// Register a note on blockchain
const response = await fetch('http://localhost:3001/api/notes/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    noteId: 'note_123',
    noteHash: 'sha256_hash_here',
    userUid: 'firebase_user_id'
  })
});
```

## � **Testing**

### **Backend Tests**
```bash
cd backend
node test-blockchain.js    # Test blockchain integration
node test-api.js          # Test API endpoints
```

### **Manual Testing**
1. Create a note and verify it appears instantly
2. Check backend logs for blockchain registration
3. Use "Refresh Status" button to update pending notes
4. Verify transaction hashes on Sepolia Etherscan

## 🚀 **Deployment**

### **Production Checklist**
- [ ] Replace Tailwind CDN with proper installation
- [ ] Set up proper Firebase security rules
- [ ] Configure production RPC endpoints
- [ ] Set up monitoring and logging
- [ ] Implement rate limiting
- [ ] Add proper error boundaries
- [ ] Set up CI/CD pipeline

### **Environment Variables**
```bash
# Backend Production
NODE_ENV=production
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
PRIVATE_KEY=0xYOUR_DEPLOYER_PRIVATE_KEY
# ... contract addresses

# Frontend Production
VITE_API_URL=https://your-backend-domain.com
VITE_FIREBASE_API_KEY=your_production_firebase_key
# ... other Firebase config
```

## 🔄 **Development Workflow**

### **Adding New Features**
1. **Frontend**: Add UI components in `frontend/src/components/`
2. **Backend**: Add API routes in `backend/index.js`
3. **Blockchain**: Add contract functions in `hardhat/contracts/`
4. **Services**: Update `frontend/src/services/firebaseService.js`

### **Common Commands**
```bash
# Start development servers
npm run dev:all          # Start all services (if configured)

# Individual services
cd backend && npm start   # Backend server
cd frontend && npm run dev # Frontend dev server

# Blockchain operations
cd hardhat && npm run compile        # Compile contracts
cd hardhat && npm run deploy:sepolia # Deploy to Sepolia
cd hardhat && npm run verify         # Verify contracts
```

## 🐛 **Troubleshooting**

### **Common Issues**

**"Module not found" errors:**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Firebase connection issues:**
- Check Firebase config in `.env` files
- Verify Firebase project settings
- Ensure Firestore is enabled

**Blockchain connection issues:**
- Verify RPC_URL is correct
- Check private key format (needs 0x prefix)
- Ensure deployer wallet has Sepolia ETH

**Notes stuck in "pending" status:**
- Click "Refresh Status" button in UI
- Check backend logs for errors
- Verify contracts are deployed and funded

## 🔧 **Firebase Collections**

### **Users Collection (`users`)**
```javascript
{
  uid: "firebase-user-id",
  email: "user@example.com",
  displayName: "User Name",
  walletAddress: "0x...",
  ownerAddress: "0x...",
  walletSalt: 0,
  createdAt: timestamp,
  lastLoginAt: timestamp,
  isActive: true
}
```

### **Notes Collection (`notes`)**
```javascript
{
  id: "note_userId_timestamp_random",
  userId: "firebase-user-id",
  title: "Note Title",
  content: "Note content...",
  contentHash: "sha256-hash",
  onChainStatus: "pending|confirmed|failed",
  transactionHash: "0x...",
  blockNumber: 123456,
  userOpHash: "0x...",
  createdAt: timestamp,
  updatedAt: timestamp,
  onChainTimestamp: timestamp
}
```

## 🔄 **User Flow**

1. **Login**: User signs in with Firebase Auth (Google OAuth)
2. **Wallet Creation**: Backend generates deterministic smart wallet address
3. **Create Note**: User writes note → Saved instantly to Firestore
4. **Blockchain Registration**: Real blockchain verification on Sepolia
5. **Status Update**: Note status updates from 'pending' to 'confirmed' in real-time

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 **Acknowledgments**

- **ERC-4337** team for Account Abstraction standard
- **Firebase** for seamless Web2 authentication
- **Ethereum Foundation** for the robust blockchain infrastructure
- **Alchemy** for reliable RPC services
- **Tailwind CSS** for the beautiful UI framework

## 📞 **Support**

- **Issues**: [GitHub Issues](https://github.com/atharvabaodhankar/GassLess-Notes-DApp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/atharvabaodhankar/GassLess-Notes-DApp/discussions)
- **Developer**: [@atharvabaodhankar](https://github.com/atharvabaodhankar)

---

**Built with ❤️ by [Atharva Baodhankar](https://github.com/atharvabaodhankar)**

*This project demonstrates how ERC-4337 Account Abstraction can create Web2-like experiences while maintaining Web3's security and decentralization benefits.*