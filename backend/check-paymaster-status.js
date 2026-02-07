const dotenv = require('dotenv');
dotenv.config();

const { ethers } = require('ethers');

async function checkPaymasterStatus() {
  console.log('🔍 Checking Paymaster Status for ERC-4337...\n');
  
  try {
    // Initialize provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    const paymasterAddress = process.env.PAYMASTER_ADDRESS;
    const entryPointAddress = process.env.ENTRY_POINT_ADDRESS;
    
    console.log('📍 Contract Addresses:');
    console.log(`   • Paymaster: ${paymasterAddress}`);
    console.log(`   • EntryPoint: ${entryPointAddress}`);
    console.log(`   • Deployer: ${wallet.address}`);
    
    // Contract ABIs
    const entryPointABI = [
      "function balanceOf(address account) public view returns (uint256)"
    ];
    
    const paymasterABI = [
      "function paymasterOwner() public view returns (address)"
    ];
    
    const entryPoint = new ethers.Contract(entryPointAddress, entryPointABI, provider);
    const paymaster = new ethers.Contract(paymasterAddress, paymasterABI, provider);
    
    // Check network info
    const network = await provider.getNetwork();
    const blockNumber = await provider.getBlockNumber();
    
    console.log('\n🌐 Network Info:');
    console.log(`   • Network: ${network.name} (Chain ID: ${network.chainId})`);
    console.log(`   • Block: ${blockNumber}`);
    
    // Check deployer balance
    const deployerBalance = await provider.getBalance(wallet.address);
    console.log('\n💰 Deployer Balance:');
    console.log(`   • Balance: ${ethers.utils.formatEther(deployerBalance)} ETH`);
    
    if (deployerBalance.lt(ethers.utils.parseEther('0.05'))) {
      console.log('   ⚠️  WARNING: Deployer balance is low!');
    } else {
      console.log('   ✅ Deployer balance is sufficient');
    }
    
    // Check paymaster deposit in EntryPoint
    const paymasterDeposit = await entryPoint.balanceOf(paymasterAddress);
    console.log('\n💰 Paymaster Status:');
    console.log(`   • Deposit in EntryPoint: ${ethers.utils.formatEther(paymasterDeposit)} ETH`);
    
    // Check paymaster owner
    const owner = await paymaster.paymasterOwner();
    console.log(`   • Owner: ${owner}`);
    console.log(`   • We are owner: ${owner.toLowerCase() === wallet.address.toLowerCase() ? 'YES' : 'NO'}`);
    
    // Estimate transaction capacity
    const avgGasCost = 0.002; // Rough estimate: 0.002 ETH per transaction
    const estimatedTransactions = Math.floor(parseFloat(ethers.utils.formatEther(paymasterDeposit)) / avgGasCost);
    
    console.log('\n📊 Transaction Capacity:');
    console.log(`   • Estimated transactions: ~${estimatedTransactions}`);
    
    // Status assessment
    console.log('\n🎯 Status Assessment:');
    
    if (paymasterDeposit.lt(ethers.utils.parseEther('0.05'))) {
      console.log('   🚨 CRITICAL: Paymaster deposit is very low!');
      console.log('   📝 Action: Fund paymaster immediately');
      console.log('   💡 Command: node fund-paymaster.js');
    } else if (paymasterDeposit.lt(ethers.utils.parseEther('0.1'))) {
      console.log('   ⚠️  WARNING: Paymaster deposit is getting low');
      console.log('   📝 Action: Consider funding paymaster soon');
    } else {
      console.log('   ✅ Paymaster deposit is sufficient');
    }
    
    if (estimatedTransactions < 25) {
      console.log('   🚨 URGENT: Can only sponsor a few more transactions!');
    } else if (estimatedTransactions < 100) {
      console.log('   ⚠️  Should top up paymaster soon');
    } else {
      console.log('   ✅ Excellent transaction capacity');
    }
    
    // Check if contracts are deployed
    const paymasterCode = await provider.getCode(paymasterAddress);
    const entryPointCode = await provider.getCode(entryPointAddress);
    
    console.log('\n🔧 Contract Status:');
    console.log(`   • Paymaster deployed: ${paymasterCode !== '0x' ? 'YES' : 'NO'}`);
    console.log(`   • EntryPoint deployed: ${entryPointCode !== '0x' ? 'YES' : 'NO'}`);
    
    if (paymasterCode === '0x' || entryPointCode === '0x') {
      console.log('   ❌ ERROR: Some contracts are not deployed!');
    } else {
      console.log('   ✅ All contracts are deployed');
    }
    
    console.log('\n🎉 Status check completed!');
    
  } catch (error) {
    console.error('❌ Status check failed:', error.message);
    if (error.code === 'NETWORK_ERROR') {
      console.error('💡 Check your RPC_URL in .env file');
    }
  }
}

// Run if called directly
if (require.main === module) {
  checkPaymasterStatus();
}

module.exports = { checkPaymasterStatus };