const { checkPaymasterStatus } = require('./check-paymaster-status');
const dotenv = require('dotenv');
dotenv.config();

const { ethers } = require('ethers');

class PaymasterMonitor {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    this.paymasterAddress = process.env.PAYMASTER_ADDRESS;
    this.entryPointAddress = process.env.ENTRY_POINT_ADDRESS;
    
    this.entryPointABI = [
      "function balanceOf(address account) public view returns (uint256)"
    ];
    
    this.paymasterABI = [
      "function fundPaymaster() external payable"
    ];
    
    this.entryPoint = new ethers.Contract(this.entryPointAddress, this.entryPointABI, this.provider);
    this.paymaster = new ethers.Contract(this.paymasterAddress, this.paymasterABI, this.wallet);
    
    this.minBalance = ethers.utils.parseEther('0.05'); // Auto-fund when below 0.05 ETH
    this.targetBalance = ethers.utils.parseEther('0.4'); // Fund up to 0.4 ETH
    
    console.log('🤖 Paymaster Monitor initialized');
    console.log(`   • Min balance: ${ethers.utils.formatEther(this.minBalance)} ETH`);
    console.log(`   • Target balance: ${ethers.utils.formatEther(this.targetBalance)} ETH`);
  }
  
  async checkAndFund() {
    try {
      const currentBalance = await this.entryPoint.balanceOf(this.paymasterAddress);
      const balanceEth = parseFloat(ethers.utils.formatEther(currentBalance));
      
      console.log(`💰 Current paymaster balance: ${balanceEth} ETH`);
      
      if (currentBalance.lt(this.minBalance)) {
        console.log('🚨 Paymaster balance is low! Auto-funding...');
        
        const fundAmount = this.targetBalance.sub(currentBalance);
        const fundAmountEth = ethers.utils.formatEther(fundAmount);
        
        console.log(`💸 Funding ${fundAmountEth} ETH...`);
        
        const tx = await this.paymaster.fundPaymaster({
          value: fundAmount,
          gasLimit: 100000
        });
        
        console.log(`📝 Funding transaction: ${tx.hash}`);
        const receipt = await tx.wait();
        
        const newBalance = await this.entryPoint.balanceOf(this.paymasterAddress);
        const newBalanceEth = ethers.utils.formatEther(newBalance);
        
        console.log(`✅ Paymaster funded! New balance: ${newBalanceEth} ETH`);
        console.log(`📍 Block: ${receipt.blockNumber}`);
        
        return {
          funded: true,
          oldBalance: balanceEth,
          newBalance: newBalanceEth,
          transactionHash: tx.hash
        };
      } else {
        console.log('✅ Paymaster balance is sufficient');
        return {
          funded: false,
          balance: balanceEth
        };
      }
      
    } catch (error) {
      console.error('❌ Auto-funding failed:', error.message);
      return {
        funded: false,
        error: error.message
      };
    }
  }
  
  startMonitoring(intervalMinutes = 30) {
    console.log(`🔄 Starting paymaster monitoring (every ${intervalMinutes} minutes)`);
    
    // Check immediately
    this.checkAndFund();
    
    // Set up periodic checks
    const intervalMs = intervalMinutes * 60 * 1000;
    setInterval(() => {
      console.log('\n⏰ Periodic paymaster check...');
      this.checkAndFund();
    }, intervalMs);
  }
  
  async getStatus() {
    try {
      const balance = await this.entryPoint.balanceOf(this.paymasterAddress);
      const balanceEth = parseFloat(ethers.utils.formatEther(balance));
      const estimatedTransactions = Math.floor(balanceEth / 0.002);
      
      return {
        balance: balanceEth,
        estimatedTransactions,
        needsFunding: balance.lt(this.minBalance),
        status: balance.lt(this.minBalance) ? 'low' : 'sufficient'
      };
    } catch (error) {
      return {
        error: error.message,
        status: 'error'
      };
    }
  }
}

// Export for use in other modules
module.exports = PaymasterMonitor;

// Run if called directly
if (require.main === module) {
  const monitor = new PaymasterMonitor();
  
  // Check once and exit
  monitor.checkAndFund().then(() => {
    console.log('🎉 Monitoring check completed');
    process.exit(0);
  });
}