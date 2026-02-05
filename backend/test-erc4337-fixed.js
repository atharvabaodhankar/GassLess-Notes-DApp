const dotenv = require('dotenv');
dotenv.config();

const blockchainService = require('./services/blockchain');

async function testFixedERC4337() {
  console.log('🎯 Testing FIXED TRUE ERC-4337 Implementation...\n');
  
  try {
    // Test 1: Network status
    console.log('1️⃣ Testing network status...');
    const networkInfo = await blockchainService.getNetworkInfo();
    console.log('✅ Network:', networkInfo.chainId, networkInfo.name);
    
    // Test 2: Create user and wallet
    console.log('\n2️⃣ Setting up user wallet...');
    const testUserId = 'fixed-erc4337-user-' + Date.now();
    
    const walletInfo = await blockchainService.getWalletInfo(testUserId);
    console.log('✅ Wallet Info:', {
      smartWallet: walletInfo.smartWallet,
      isDeployed: walletInfo.isDeployed,
      balance: walletInfo.balance + ' ETH'
    });
    
    // Test 3: Deploy wallet if needed
    if (!walletInfo.isDeployed) {
      console.log('\n3️⃣ Deploying smart wallet...');
      const deployResult = await blockchainService.deployUserWallet(testUserId);
      console.log('✅ Wallet deployed:', deployResult.transactionHash);
    }
    
    // Test 4: Fund wallet with ETH for gas
    console.log('\n4️⃣ Funding smart wallet with ETH...');
    const fundResult = await blockchainService.fundUserWallet(testUserId, '0.005'); // 0.005 ETH
    console.log('✅ Wallet funded:', {
      transaction: fundResult.transactionHash,
      amount: fundResult.amount + ' ETH'
    });
    
    // Test 5: Check updated balance
    console.log('\n5️⃣ Checking wallet balance...');
    const updatedWalletInfo = await blockchainService.getWalletInfo(testUserId);
    console.log('✅ Updated balance:', updatedWalletInfo.balance + ' ETH');
    
    // Test 6: TRUE ERC-4337 note registration (should work now!)
    console.log('\n6️⃣ Testing TRUE ERC-4337 note registration...');
    const testNoteId = `fixed-erc4337-note-${Date.now()}`;
    const testNoteHash = 'deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
    
    console.log(`📝 Registering note with funded wallet...`);
    const registrationResult = await blockchainService.registerNoteOnChain(
      testNoteId, 
      testNoteHash, 
      testUserId
    );
    
    if (registrationResult.status === 'confirmed') {
      console.log('✅ TRUE ERC-4337 SUCCESS!');
      console.log(`📍 Transaction: ${registrationResult.transactionHash}`);
      console.log(`📍 Block: ${registrationResult.blockNumber}`);
      console.log(`📍 ERC-4337 Mode: ${registrationResult.erc4337 ? 'TRUE' : 'FALLBACK'}`);
      console.log(`📍 Paymaster Used: ${registrationResult.paymasterUsed ? 'YES' : 'NO (user paid)'}`);
      console.log(`📍 Gas Used: ${registrationResult.gasUsed}`);
      
      // Test 7: Verify the note
      console.log('\n7️⃣ Testing note verification...');
      const verificationResult = await blockchainService.verifyNoteOnChain(
        testNoteId, 
        testNoteHash
      );
      
      if (verificationResult.verified) {
        console.log('✅ Note verification successful!');
        console.log(`📍 Owner: ${verificationResult.owner}`);
      } else {
        console.log('❌ Note verification failed:', verificationResult.reason);
      }
      
    } else {
      console.log('❌ Note registration failed:', registrationResult.error);
    }
    
    // Test 8: Final wallet state
    console.log('\n8️⃣ Final wallet state...');
    const finalWalletInfo = await blockchainService.getWalletInfo(testUserId);
    console.log('✅ Final State:', {
      smartWallet: finalWalletInfo.smartWallet,
      balance: finalWalletInfo.balance + ' ETH',
      nonce: finalWalletInfo.nonce
    });
    
    console.log('\n🎉 FIXED ERC-4337 Test Completed!');
    console.log('\n📊 Summary:');
    console.log(`   • Smart Wallet: ${finalWalletInfo.smartWallet}`);
    console.log(`   • ERC-4337 Mode: ${registrationResult.erc4337 ? 'TRUE UserOperations' : 'Fallback'}`);
    console.log(`   • Gas Payment: ${registrationResult.paymasterUsed ? 'Paymaster' : 'User Wallet'}`);
    console.log(`   • Transaction: ${registrationResult.transactionHash}`);
    console.log(`   • Remaining Balance: ${finalWalletInfo.balance} ETH`);
    
  } catch (error) {
    console.error('❌ Test Failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testFixedERC4337();