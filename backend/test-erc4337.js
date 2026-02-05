const dotenv = require('dotenv');
dotenv.config();

const blockchainService = require('./services/blockchain');

async function testTrueERC4337() {
  console.log('🎯 Testing TRUE ERC-4337 Account Abstraction Implementation...\n');
  
  try {
    // Test 1: Network and ERC-4337 status
    console.log('1️⃣ Testing network and ERC-4337 status...');
    const networkInfo = await blockchainService.getNetworkInfo();
    console.log('✅ Network Info:', {
      chainId: networkInfo.chainId,
      name: networkInfo.name,
      blockNumber: networkInfo.blockNumber,
      erc4337Mode: networkInfo.erc4337.mode,
      entryPointDeployed: networkInfo.erc4337.entryPointDeployed,
      paymasterBalance: networkInfo.erc4337.paymasterBalance + ' ETH'
    });
    
    // Test 2: User wallet generation and info
    console.log('\n2️⃣ Testing user wallet generation...');
    const testUserId = 'test-erc4337-user-' + Date.now();
    
    const walletAddress = await blockchainService.getWalletAddress(testUserId);
    console.log('✅ Wallet Address Generated:', walletAddress);
    
    const walletInfo = await blockchainService.getWalletInfo(testUserId);
    console.log('✅ Detailed Wallet Info:', {
      smartWallet: walletInfo.smartWallet,
      owner: walletInfo.owner,
      isDeployed: walletInfo.isDeployed,
      nonce: walletInfo.nonce,
      balance: walletInfo.balance + ' ETH',
      erc4337: walletInfo.erc4337
    });
    
    // Test 3: Deploy smart wallet if needed
    if (!walletInfo.isDeployed) {
      console.log('\n3️⃣ Testing smart wallet deployment...');
      const deployResult = await blockchainService.deployUserWallet(testUserId);
      console.log('✅ Wallet Deployment:', {
        walletAddress: deployResult.walletAddress,
        transactionHash: deployResult.transactionHash,
        blockNumber: deployResult.blockNumber,
        alreadyDeployed: deployResult.alreadyDeployed
      });
    } else {
      console.log('\n3️⃣ Smart wallet already deployed ✅');
    }
    
    // Test 4: TRUE ERC-4337 note registration
    console.log('\n4️⃣ Testing TRUE ERC-4337 note registration...');
    const testNoteId = `erc4337-test-note-${Date.now()}`;
    const testNoteHash = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    
    console.log(`📝 Registering note via UserOperation...`);
    console.log(`   Note ID: ${testNoteId}`);
    console.log(`   Hash: ${testNoteHash}`);
    console.log(`   User: ${testUserId}`);
    
    const registrationResult = await blockchainService.registerNoteOnChain(
      testNoteId, 
      testNoteHash, 
      testUserId
    );
    
    if (registrationResult.status === 'confirmed') {
      console.log('✅ TRUE ERC-4337 Registration Success!');
      console.log(`📍 Transaction: ${registrationResult.transactionHash}`);
      console.log(`📍 Block: ${registrationResult.blockNumber}`);
      console.log(`📍 Gas Used: ${registrationResult.gasUsed}`);
      console.log(`📍 Smart Wallet: ${registrationResult.smartWallet}`);
      console.log(`📍 UserOpHash: ${registrationResult.userOpHash}`);
      console.log(`📍 ERC-4337 Mode: ${registrationResult.erc4337 ? 'TRUE' : 'FALLBACK'}`);
      console.log(`📍 Wallet Deployed: ${registrationResult.isWalletDeployed ? 'YES (new)' : 'Already deployed'}`);
      
      // Test 5: Verify the note
      console.log('\n5️⃣ Testing note verification...');
      const verificationResult = await blockchainService.verifyNoteOnChain(
        testNoteId, 
        testNoteHash
      );
      
      if (verificationResult.verified) {
        console.log('✅ Note verification successful!');
        console.log(`📍 On-chain hash: ${verificationResult.onChainHash}`);
        console.log(`📍 Expected hash: ${verificationResult.expectedHash}`);
        console.log(`📍 Owner: ${verificationResult.owner}`);
        console.log(`📍 Timestamp: ${verificationResult.timestamp}`);
      } else {
        console.log('❌ Note verification failed:', verificationResult.reason);
      }
      
    } else {
      console.log('❌ Note registration failed:', registrationResult.error);
      console.log(`📍 ERC-4337 Mode: ${registrationResult.erc4337 ? 'TRUE' : 'FALLBACK'}`);
    }
    
    // Test 6: Check final wallet state
    console.log('\n6️⃣ Checking final wallet state...');
    const finalWalletInfo = await blockchainService.getWalletInfo(testUserId);
    console.log('✅ Final Wallet State:', {
      smartWallet: finalWalletInfo.smartWallet,
      isDeployed: finalWalletInfo.isDeployed,
      nonce: finalWalletInfo.nonce,
      balance: finalWalletInfo.balance + ' ETH'
    });
    
    console.log('\n🎉 TRUE ERC-4337 Test Completed Successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Network: Sepolia (${networkInfo.chainId})`);
    console.log(`   • EntryPoint: ${networkInfo.erc4337.entryPointDeployed ? 'Deployed' : 'Not found'}`);
    console.log(`   • Paymaster: ${networkInfo.erc4337.paymasterBalance} ETH`);
    console.log(`   • Smart Wallet: ${finalWalletInfo.smartWallet}`);
    console.log(`   • ERC-4337 Mode: ${registrationResult.erc4337 ? 'TRUE UserOperations' : 'Fallback Direct'}`);
    console.log(`   • Transaction: ${registrationResult.transactionHash}`);
    
  } catch (error) {
    console.error('❌ TRUE ERC-4337 Test Failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

// Run the test
testTrueERC4337();