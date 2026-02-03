const dotenv = require('dotenv');
dotenv.config();

const blockchainService = require('./services/blockchain');

async function testBlockchainIntegration() {
  console.log('🧪 Testing Real Blockchain Integration...\n');
  
  try {
    // Test 1: Get network info
    console.log('1️⃣ Testing network connection...');
    const networkInfo = await blockchainService.getNetworkInfo();
    console.log('✅ Network Info:', {
      chainId: networkInfo.chainId,
      name: networkInfo.name,
      blockNumber: networkInfo.blockNumber
    });
    
    // Test 2: Get wallet address
    console.log('\n2️⃣ Testing wallet address generation...');
    const testUserId = 'test-user-123';
    const walletInfo = await blockchainService.getWalletAddress(testUserId);
    console.log('✅ Wallet Info:', walletInfo);
    
    // Test 3: Register a test note
    console.log('\n3️⃣ Testing note registration on Sepolia...');
    const testNoteId = `test-note-${Date.now()}`;
    const testNoteHash = '1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';
    
    console.log(`📝 Registering note: ${testNoteId}`);
    console.log(`🔐 Hash: ${testNoteHash}`);
    
    const registrationResult = await blockchainService.registerNoteOnChain(
      testNoteId, 
      testNoteHash, 
      testUserId
    );
    
    if (registrationResult.status === 'confirmed') {
      console.log('✅ Note registered successfully!');
      console.log(`📍 Transaction: ${registrationResult.transactionHash}`);
      console.log(`📍 Block: ${registrationResult.blockNumber}`);
      
      // Test 4: Verify the note
      console.log('\n4️⃣ Testing note verification...');
      const verificationResult = await blockchainService.verifyNoteOnChain(
        testNoteId, 
        testNoteHash
      );
      
      if (verificationResult.verified) {
        console.log('✅ Note verification successful!');
        console.log('📍 On-chain hash matches expected hash');
      } else {
        console.log('❌ Note verification failed:', verificationResult.reason);
      }
    } else {
      console.log('❌ Note registration failed:', registrationResult.error);
    }
    
    console.log('\n🎉 Blockchain integration test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  }
}

// Run the test
testBlockchainIntegration();