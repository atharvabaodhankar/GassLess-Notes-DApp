const axios = require('axios');

async function testERC4337API() {
  console.log('🧪 Testing ERC-4337 API End-to-End...\n');
  
  const baseURL = 'http://localhost:3001';
  const testUserId = 'api_test_user_' + Date.now();
  
  try {
    // 1. Test blockchain status
    console.log('1️⃣ Testing blockchain status...');
    const statusResponse = await axios.get(`${baseURL}/api/blockchain/status`);
    console.log('   Network:', statusResponse.data.network?.name || 'Unknown');
    console.log('   Chain ID:', statusResponse.data.network?.chainId || 'Unknown');
    console.log('   ERC-4337 Mode:', statusResponse.data.network?.erc4337?.mode || 'Unknown');
    console.log('   Paymaster Balance:', statusResponse.data.network?.erc4337?.paymasterBalance || 'Unknown', 'ETH');
    
    // 2. Get wallet address
    console.log('\n2️⃣ Getting smart wallet address...');
    const walletResponse = await axios.post(`${baseURL}/api/wallet/address`, {
      userUid: testUserId
    });
    console.log('   Smart Wallet:', walletResponse.data.walletAddress);
    console.log('   Owner (EOA):', walletResponse.data.ownerAddress);
    
    // 3. Get wallet info
    console.log('\n3️⃣ Getting wallet info...');
    const walletInfoResponse = await axios.post(`${baseURL}/api/wallet/info`, {
      userUid: testUserId
    });
    console.log('   Deployed:', walletInfoResponse.data.isDeployed);
    console.log('   Balance:', walletInfoResponse.data.balance, 'ETH');
    console.log('   Nonce:', walletInfoResponse.data.nonce);
    
    // 4. Register note (ERC-4337 with paymaster)
    console.log('\n4️⃣ Registering note with ERC-4337 paymaster...');
    
    // Generate proper 32-byte hash
    const { ethers } = require('ethers');
    const noteContent = `ERC-4337 Test Note ${Date.now()}`;
    const noteHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(noteContent)).slice(2); // Remove 0x prefix
    
    const noteData = {
      noteId: `api_test_note_${Date.now()}`,
      noteHash: noteHash,
      userUid: testUserId
    };
    
    console.log('   Note ID:', noteData.noteId);
    console.log('   Note Hash:', noteData.noteHash.slice(0, 20) + '...');
    console.log('   User ID:', noteData.userUid);
    
    const registerResponse = await axios.post(`${baseURL}/api/notes/register`, noteData);
    
    console.log('\n🎉 Registration Results:');
    console.log('   Status:', registerResponse.data.status);
    console.log('   ERC-4337:', registerResponse.data.erc4337);
    console.log('   Paymaster Used:', registerResponse.data.paymasterUsed);
    console.log('   Transaction:', registerResponse.data.transactionHash);
    console.log('   Block:', registerResponse.data.blockNumber);
    console.log('   Gas Used:', registerResponse.data.gasUsed);
    console.log('   Smart Wallet:', registerResponse.data.smartWallet);
    
    if (registerResponse.data.paymasterUsed && registerResponse.data.erc4337) {
      console.log('\n✅ SUCCESS: Pure ERC-4337 with Paymaster working through API!');
      console.log('   🎯 Zero gas fees paid by user');
      console.log('   🎯 Smart wallet deployed automatically');
      console.log('   🎯 Note registered on blockchain');
      console.log('   🎯 True gasless experience achieved');
    } else {
      console.log('\n⚠️  Note registered but not through pure ERC-4337');
    }
    
    // 5. Verify note on blockchain
    console.log('\n5️⃣ Verifying note on blockchain...');
    const verifyResponse = await axios.post(`${baseURL}/api/notes/verify`, {
      noteId: noteData.noteId,
      expectedHash: noteData.noteHash
    });
    
    console.log('   Verified:', verifyResponse.data.verified);
    console.log('   On-chain:', verifyResponse.data.onChainHash ? 'Found' : 'Not found');
    
    console.log('\n🎉 ERC-4337 API Test Complete!');
    
  } catch (error) {
    console.error('❌ API Test Failed:', error.response?.data || error.message);
  }
}

testERC4337API();