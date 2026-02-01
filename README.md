# 🚀 Gasless Notes App (ERC-4337 + Firebase)

A Web2-like notes application with blockchain integrity verification using ERC-4337 Account Abstraction and Firebase.

## 🎯 Features

- **No MetaMask Required**: Users authenticate with Firebase Auth
- **Gasless Transactions**: All blockchain interactions are sponsored by paymaster
- **Instant UX**: Notes are saved immediately to Firebase, blockchain verification happens asynchronously
- **Blockchain Integrity**: All notes are hash-verified on-chain for tamper-proof storage
- **Smart Wallet**: Each user gets an ERC-4337 smart contract wallet
- **Real-time Updates**: Firebase Firestore provides real-time note synchronization

## 🏗️ Architecture

```
Frontend (React + Firebase) → Firebase Firestore → Simulated Blockchain Verification
```

### Components:
- **Frontend**: Vite + React + Firebase Auth + Firestore + Tailwind CSS
- **Database**: Firebase Firestore (replaces MongoDB)
- **Authentication**: Firebase Auth with Google Sign-in
- **Smart Contracts**: ERC-4337 Account Factory + Notes Registry + Paymaster (for future integration)
- **Blockchain**: Simulated verification (easily replaceable with real blockchain)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Firebase Project
- Git

### 1. Clone and Install

```bash
git clone <your-repo>
cd gasless-notes-app

# Install frontend dependencies
cd frontend && npm install
```

### 2. Firebase Setup

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication with Email/Password and Google
3. Enable Firestore Database
4. Get your Firebase config from Project Settings
5. Update `frontend/src/config/firebase.js` with your config

### 3. Start Development

```bash
# Start frontend (main app)
cd frontend
npm run dev
```

### 4. Access the App

- Frontend: http://localhost:5173
- Firebase Console: https://console.firebase.google.com

## 📁 Project Structure

```
gasless-notes-app/
├── frontend/                 # React + Vite + Firebase frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── contexts/        # Auth context
│   │   ├── services/        # Firebase services
│   │   └── config/          # Firebase config
│   └── package.json
├── hardhat/                  # Smart contracts (for future blockchain integration)
│   ├── contracts/           # Solidity contracts
│   ├── scripts/             # Deployment scripts
│   └── package.json
└── README.md
```

## 🔧 Firebase Collections

### Users Collection (`users`)
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

### Notes Collection (`notes`)
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

## 🔄 User Flow

1. **Login**: User signs in with Firebase Auth (Email/Password or Google)
2. **Wallet Creation**: Frontend generates simulated wallet address
3. **Create Note**: User writes note → Saved instantly to Firestore
4. **Blockchain Simulation**: Simulated blockchain verification (2-5 seconds delay)
5. **Status Update**: Note status updates from 'pending' to 'confirmed' in real-time

## 🛠️ Development Commands

### Frontend
```bash
cd frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

### Smart Contracts (Optional)
```bash
cd hardhat
npm install          # Install dependencies
npm run compile      # Compile contracts
npm run node         # Start local node
npm run deploy:local # Deploy to local network
```

## 🌐 Deployment

### Frontend Deployment (Vercel/Netlify)

1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to your hosting service
3. Set up environment variables in your hosting dashboard

### Firebase Security Rules

Update Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Users can only access their own notes
    match /notes/{noteId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
    }
  }
}
```

## 🔐 Security Features

- Firebase Authentication with JWT tokens
- Firestore security rules for data access control
- Client-side input validation and sanitization
- Content hashing for integrity verification
- Simulated blockchain verification (easily replaceable)

## 📊 Real-time Features

- **Live Note Updates**: Changes sync across all user sessions
- **Status Tracking**: Real-time blockchain verification status
- **Instant Saves**: Notes save immediately without waiting for blockchain
- **Optimistic UI**: Immediate feedback with background processing

## 🔮 Future Blockchain Integration

The app is designed to easily integrate with real blockchain:

1. Replace simulated functions in `firebaseService.js`
2. Deploy smart contracts from `hardhat/` folder
3. Integrate with real ERC-4337 bundler
4. Add backend service for UserOperation signing

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with Firebase
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Troubleshooting

### Common Issues

1. **Firebase Auth not working**: 
   - Check Firebase config in `firebase.js`
   - Enable auth methods in Firebase Console
   - Verify domain is authorized

2. **Firestore permission denied**:
   - Check security rules
   - Ensure user is authenticated
   - Verify user owns the data

3. **Real-time updates not working**:
   - Check internet connection
   - Verify Firestore rules allow reads
   - Check browser console for errors

### Getting Help

- Check the browser console for detailed error messages
- Verify Firebase project configuration
- Test authentication flow step by step

---

Built with ❤️ using Firebase + ERC-4337 Account Abstraction