const dotenv = require('dotenv');
dotenv.config();

const { ethers } = require('ethers');

async function testPaymaster() {
  console.log('🧪 Testing Paymaster ERC-4337 Integration...\n');
  
  try {
    // Initialize provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    const paymasterAddress = process.env.PAYMASTER_ADDRESS;
    const entryPointAddress = process.env.ENTRY_POINT_ADDRESS;
    
    console.log('📍 Testing Configuration:');
    console.log('   Paymaster:', paymasterAddress);
    console.log('   EntryPoint:', entryPointAddress);
    console.log('   Network:', process.env.RPC_URL);
    
    // EntryPoint ABI for checking deposits
    const entryPointABI = [
      "function balanceOf(address account) public view returns (uint256)"
    ];
    
    const entryPoint = new ethers.Contract(entryPointAddress, entryPointABI, wallet);
    
    // Check paymaster deposit
    console.log('\n1️⃣ Checking paymaster deposit...');
    const paymasterDeposit = await entryPoint.balanceOf(paymasterAddress);
    console.log(`💰 Paymaster deposit: ${ethers.utils.formatEther(paymasterDeposit)} ETH`);
    
    if (paymasterDeposit.gt(0)) {
      console.log('✅ Paymaster has sufficient deposit for sponsoring transactions');
    } else {
      console.log('❌ Paymaster has no deposit - cannot sponsor transactions');
      return;
    }
    
    // Test blockchain service
    console.log('\n2️⃣ Testing blockchain service...');
    const blockchainService = require('./services/blockchain');
    
    // Test wallet creation
    const testUserId = 'test_user_' + Date.now();
    console.log(`👤 Test user ID: ${testUserId}`);
    
    const walletInfo = await blockchainService.getWalletAddress(testUserId);
    console.log(`👛 Smart wallet: ${walletInfo.walletAddress}`);
    console.log(`👤 Owner (EOA): ${walletInfo.ownerAddress}`);
    
    // Check if wallet is deployed
    const isDeployed = await blockchainService.isWalletDeployed(walletInfo.walletAddress);
    console.log(`📦 Wallet deployed: ${isDeployed}`);
    
    // Test note registration with paymaster
    console.log('\n3️⃣ Testing note registration with paymaster...');
    const testNoteId = `test_note_${Date.now()}`;
    const testNoteHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Test note content')).slice(2);
    
    console.log(`📝 Test note ID: ${testNoteId}`);
    console.log(`🔐 Test note hash: ${testNoteHash}`);
    
    const result = await blockchainService.registerNoteOnChain(testNoteId, testNoteHash, testUserId);
    
    console.log('\n🎉 Test Results:');
    console.log('   Status:', result.status);
    console.log('   ERC-4337:', result.erc4337);
    console.log('   Paymaster Used:', result.paymasterUsed);
    
    if (result.status === 'confirmed') {
      console.log('   Transaction:', result.transactionHash);
      console.log('   Block:', result.blockNumber);
      console.log('   Gas Used:', result.gasUsed);
      console.log('   Smart Wallet:', result.smartWallet);
      
      if (result.paymasterUsed) {
        console.log('✅ SUCCESS: Pure ERC-4337 with paymaster sponsorship working!');
      } else {
        console.log('⚠️  WARNING: Transaction succeeded but paymaster was not used');
      }
    } else {
      console.log('❌ FAILED:', result.error || result.reason);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

testPaymaster();