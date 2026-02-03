const { ethers } = require("hardhat");

async function main() {
  console.log("🔍 Checking Sepolia Balance...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deployer address:", deployer.address);

  // Check balance
  const balance = await ethers.provider.getBalance(deployer.address);
  const balanceInEth = ethers.formatEther(balance);
  
  console.log("Balance:", balanceInEth, "ETH");
  
  if (parseFloat(balanceInEth) < 0.1) {
    console.log("⚠️  WARNING: Low balance! You need at least 0.1 ETH for deployment.");
    console.log("Get Sepolia ETH from: https://sepoliafaucet.com/");
  } else {
    console.log("✅ Balance sufficient for deployment!");
  }

  // Check network
  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name, "Chain ID:", network.chainId);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });