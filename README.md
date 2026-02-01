# 🚀 Gasless Notes App (ERC-4337)

A Web2-like notes application with blockchain integrity verification using ERC-4337 Account Abstraction.

## 🎯 Features

- **No MetaMask Required**: Users authenticate with Firebase Auth
- **Gasless Transactions**: All blockchain interactions are sponsored by paymaster
- **Instant UX**: Notes are saved immediately, blockchain verification happens asynchronously
- **Blockchain Integrity**: All notes are hash-verified on-chain for tamper-proof storage
- **Smart Wallet**: Each user gets an ERC-4337 smart contract wallet

## 🏗️ Architecture

```
Frontend (React + Vite) → Backend (Node.js + Express) → ERC-4337 Infrastructure → Blockchain
```

### Components:
- **Frontend**: Vite + React + Firebase Auth + Tailwind CSS
- **Backend**: Node.js + Express + MongoDB + Firebase Admin
- **Smart Contracts**: ERC-4337 Account Factory + Notes Registry + Paymaster
- **Blockchain**: Hardhat (local) / Sepolia (testnet)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB
- Git

### 1. Clone and Install

```bash
git clone <your-repo>
cd gasless-notes-app

# Install all dependencies
npm run install:all
```

### 2. Environment Setup

```bash
# Copy environment files
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
cp hardhat/.env.example hardhat/.env

# Edit the .env files with your configuration
```

### 3. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication with Email/Password and Google
3. Generate a service account key
4. Update `frontend/.env` and `backend/.env` with Firebase config

### 4. Start Local Development

```bash
# Terminal 1: Start Hardhat node
cd hardhat
npm install
npm run node

# Terminal 2: Deploy contracts
npm run deploy:local

# Terminal 3: Start backend
cd ../backend
npm install
npm run dev

# Terminal 4: Start frontend
cd ../frontend
npm install
npm run dev
```

### 5. Access the App

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001
- Hardhat Network: http://localhost:8545

## 📁 Project Structure

```
gasless-notes-app/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # Auth context
│   │   ├── services/        # API services
│   │   └── config/          # Firebase config
│   └── package.json
├── backend/                  # Node.js backend
│   ├── routes/              # API routes
│   ├── models/              # MongoDB models
│   ├── services/            # Blockchain service
│   ├── middleware/          # Auth middleware
│   └── package.json
├── hardhat/                  # Smart contracts
│   ├── contracts/           # Solidity contracts
│   ├── scripts/             # Deployment scripts
│   ├── deployments/         # Contract addresses
│   └── package.json
└── README.md
```

## 🔧 Smart Contracts

### SimpleAccount (ERC-4337)
- User's smart contract wallet
- Validates signatures and executes transactions
- Deployed per user via factory pattern

### NotesRegistry
- Stores note hashes on-chain
- Provides integrity verification
- Minimal storage for gas efficiency

### NotesPaymaster
- Sponsors gas fees for users
- Enforces usage policies
- Rate limiting and security controls

## 🔄 User Flow

1. **Login**: User signs in with Firebase Auth
2. **Wallet Creation**: Backend creates ERC-4337 smart wallet
3. **Create Note**: User writes note → Saved instantly to DB
4. **Blockchain Verification**: Backend builds UserOperation → Paymaster sponsors → Bundler submits
5. **Status Update**: Note status updates from 'pending' to 'confirmed'

## 🛠️ Development Commands

### Frontend
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Backend
```bash
cd backend
npm run dev          # Start with nodemon
npm start            # Start production server
```

### Hardhat
```bash
cd hardhat
npm run compile      # Compile contracts
npm run node         # Start local node
npm run deploy:local # Deploy to local network
npm run deploy:sepolia # Deploy to Sepolia
```

## 🌐 Deployment

### Sepolia Testnet

1. Get Sepolia ETH from faucet
2. Update `hardhat/.env` with Sepolia RPC and private key
3. Deploy contracts: `npm run deploy:sepolia`
4. Update backend `.env` with contract addresses
5. Deploy backend to your preferred hosting service
6. Deploy frontend to Vercel/Netlify

### Production Considerations

- Use proper key management (AWS KMS, etc.)
- Implement proper rate limiting
- Add monitoring and logging
- Use production-grade bundler service
- Implement proper error handling

## 🔐 Security Features

- Firebase JWT authentication
- Smart contract signature validation
- Paymaster policy enforcement
- Rate limiting per user
- Input validation and sanitization

## 📊 Monitoring

The app includes built-in status tracking:
- Note creation status
- Blockchain verification status
- Transaction hash tracking
- Gas usage monitoring (sponsored)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

### Common Issues

1. **Firebase Auth not working**: Check Firebase config and enable auth methods
2. **Contracts not deploying**: Ensure Hardhat node is running and funded
3. **Backend connection issues**: Verify MongoDB is running and connection string is correct
4. **Frontend not connecting**: Check API base URL in frontend `.env`

### Getting Help

- Check the console logs for detailed error messages
- Ensure all services are running (MongoDB, Hardhat node, Backend)
- Verify environment variables are set correctly

---

Built with ❤️ using ERC-4337 Account Abstraction