const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  console.log('🧪 Testing Backend API Endpoints...\n');
  
  const baseURL = 'http://localhost:3001';
  
  try {
    // Test 1: Health check
    console.log('1️⃣ Testing health endpoint...');
    const healthResponse = await fetch(`${baseURL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health:', healthData.status);
    
    // Test 2: Blockchain status
    console.log('\n2️⃣ Testing blockchain status...');
    const statusResponse = await fetch(`${baseURL}/api/blockchain/status`);
    const statusData = await statusResponse.json();
    console.log('✅ Blockchain Status:', statusData.status);
    console.log('📍 Chain ID:', statusData.network.chainId);
    console.log('📍 Block Number:', statusData.network.blockNumber);
    
    // Test 3: Get wallet address
    console.log('\n3️⃣ Testing wallet address endpoint...');
    const walletResponse = await fetch(`${baseURL}/api/wallet/address`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userUid: 'test-api-user-456' })
    });
    const walletData = await walletResponse.json();
    console.log('✅ Wallet Address:', walletData.walletAddress);
    
    // Test 4: Register note
    console.log('\n4️⃣ Testing note registration endpoint...');
    const testNoteId = `api-test-note-${Date.now()}`;
    const testHash = 'abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890';
    
    const registerResponse = await fetch(`${baseURL}/api/notes/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        noteId: testNoteId,
        noteHash: testHash,
        userUid: 'test-api-user-456'
      })
    });
    const registerData = await registerResponse.json();
    
    if (registerData.status === 'confirmed') {
      console.log('✅ Note registered via API!');
      console.log('📍 Transaction:', registerData.transactionHash);
      console.log('📍 Block:', registerData.blockNumber);
      
      // Test 5: Verify note
      console.log('\n5️⃣ Testing note verification endpoint...');
      const verifyResponse = await fetch(`${baseURL}/api/notes/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          noteId: testNoteId,
          expectedHash: testHash
        })
      });
      const verifyData = await verifyResponse.json();
      
      if (verifyData.verified) {
        console.log('✅ Note verified via API!');
      } else {
        console.log('❌ Note verification failed:', verifyData.reason);
      }
      
      // Test 6: Check transaction status
      console.log('\n6️⃣ Testing transaction status endpoint...');
      const txResponse = await fetch(`${baseURL}/api/transaction/${registerData.transactionHash}`);
      const txData = await txResponse.json();
      console.log('✅ Transaction Status:', txData.status);
      console.log('📍 Confirmations:', txData.confirmations);
      
    } else {
      console.log('❌ Note registration failed:', registerData.error);
    }
    
    console.log('\n🎉 API test completed successfully!');
    
  } catch (error) {
    console.error('❌ API test failed:', error.message);
  }
}

testAPI();