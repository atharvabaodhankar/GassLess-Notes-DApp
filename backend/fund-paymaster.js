const dotenv = require('dotenv');
dotenv.config();

const { ethers } = require('ethers');

async function fundPaymaster() {
  console.log('💰 Funding Paymaster for TRUE ERC-4337...\n');
  
  try {
    // Initialize provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    const paymasterAddress = process.env.PAYMASTER_ADDRESS;
    const entryPointAddress = process.env.ENTRY_POINT_ADDRESS;
    
    console.log('📍 Paymaster:', paymasterAddress);
    console.log('📍 EntryPoint:', entryPointAddress);
    
    // Paymaster ABI for funding
    const paymasterABI = [
      "function fundPaymaster() external payable",
      "function getDeposit() public view returns (uint256)",
      "function paymasterOwner() public view returns (address)"
    ];
    
    // EntryPoint ABI for checking deposits
    const entryPointABI = [
      "function balanceOf(address account) public view returns (uint256)",
      "function depositTo(address account) public payable"
    ];
    
    const paymaster = new ethers.Contract(paymasterAddress, paymasterABI, wallet);
    const entryPoint = new ethers.Contract(entryPointAddress, entryPointABI, wallet);
    
    // Check current paymaster deposit
    console.log('1️⃣ Checking current paymaster deposit...');
    const currentDeposit = await entryPoint.balanceOf(paymasterAddress);
    console.log(`💰 Current deposit: ${ethers.utils.formatEther(currentDeposit)} ETH`);
    
    // Check paymaster owner
    const owner = await paymaster.paymasterOwner();
    console.log(`👤 Paymaster owner: ${owner}`);
    console.log(`👤 Our wallet: ${wallet.address}`);
    
    if (owner.toLowerCase() !== wallet.address.toLowerCase()) {
      console.log('❌ ERROR: We are not the paymaster owner!');
      console.log('   The paymaster can only be funded by its owner.');
      return;
    }
    
    // Fund paymaster if needed
    const targetDeposit = ethers.utils.parseEther('0.4'); // 0.4 ETH
    
    if (currentDeposit.lt(targetDeposit)) {
      const fundAmount = targetDeposit.sub(currentDeposit);
      console.log(`\n2️⃣ Funding paymaster with ${ethers.utils.formatEther(fundAmount)} ETH...`);
      
      const tx = await paymaster.fundPaymaster({
        value: fundAmount,
        gasLimit: 100000
      });
      
      console.log(`📝 Funding transaction sent: ${tx.hash}`);
      const receipt = await tx.wait();
      console.log(`✅ Paymaster funded! Block: ${receipt.blockNumber}`);
      
      // Check new deposit
      const newDeposit = await entryPoint.balanceOf(paymasterAddress);
      console.log(`💰 New deposit: ${ethers.utils.formatEther(newDeposit)} ETH`);
      
    } else {
      console.log(`✅ Paymaster already has sufficient deposit: ${ethers.utils.formatEther(currentDeposit)} ETH`);
    }
    
    // Final status
    console.log('\n🎉 Paymaster funding completed!');
    console.log('📊 Final Status:');
    console.log(`   • Paymaster: ${paymasterAddress}`);
    console.log(`   • Deposit: ${ethers.utils.formatEther(await entryPoint.balanceOf(paymasterAddress))} ETH`);
    console.log(`   • Ready for ERC-4337: YES`);
    
  } catch (error) {
    console.error('❌ Paymaster funding failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

fundPaymaster();