const { ethers } = require("hardhat");
require('dotenv').config();

async function main() {
  console.log("🔍 Checking Paymaster and Deployer Balances on Sepolia...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("📍 Deployer address:", deployer.address);

  // Check deployer balance
  const deployerBalance = await ethers.provider.getBalance(deployer.address);
  const deployerBalanceInEth = ethers.formatEther(deployerBalance);
  
  console.log("💰 Deployer balance:", deployerBalanceInEth, "ETH");
  
  // Get paymaster address from env
  const paymasterAddress = process.env.PAYMASTER_ADDRESS;
  if (!paymasterAddress) {
    console.error("❌ PAYMASTER_ADDRESS not found in .env file");
    return;
  }
  
  console.log("📍 Paymaster address:", paymasterAddress);
  
  // Check paymaster balance
  const paymasterBalance = await ethers.provider.getBalance(paymasterAddress);
  const paymasterBalanceInEth = ethers.formatEther(paymasterBalance);
  
  console.log("💰 Paymaster balance:", paymasterBalanceInEth, "ETH");
  
  // Check network
  const network = await ethers.provider.getNetwork();
  console.log("🌐 Network:", network.name, "Chain ID:", network.chainId);
  
  // Analysis and recommendations
  console.log("\n📊 Analysis:");
  
  if (parseFloat(deployerBalanceInEth) < 0.05) {
    console.log("⚠️  WARNING: Deployer balance is low! Consider adding more ETH.");
    console.log("   Get Sepolia ETH from: https://sepoliafaucet.com/");
  } else {
    console.log("✅ Deployer balance is sufficient");
  }
  
  if (parseFloat(paymasterBalanceInEth) < 0.01) {
    console.log("🚨 CRITICAL: Paymaster balance is very low!");
    console.log("   Paymaster needs ETH to sponsor gas fees for users");
    console.log("   Recommended: At least 0.1 ETH for production use");
  } else if (parseFloat(paymasterBalanceInEth) < 0.05) {
    console.log("⚠️  WARNING: Paymaster balance is getting low");
    console.log("   Consider adding more ETH soon");
  } else {
    console.log("✅ Paymaster balance is sufficient");
  }
  
  // Estimate how many transactions the paymaster can sponsor
  const avgGasCost = 0.002; // Rough estimate: 0.002 ETH per transaction
  const estimatedTransactions = Math.floor(parseFloat(paymasterBalanceInEth) / avgGasCost);
  
  console.log(`📈 Estimated transactions paymaster can sponsor: ~${estimatedTransactions}`);
  
  if (estimatedTransactions < 10) {
    console.log("🚨 URGENT: Paymaster can only sponsor a few more transactions!");
  } else if (estimatedTransactions < 50) {
    console.log("⚠️  Paymaster balance should be topped up soon");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });