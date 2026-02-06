const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');

async function main() {
  console.log("🚀 Deploying Standard ERC-4337 Contracts to Sepolia...\n");

  const [deployer] = await ethers.getSigners();
  console.log("📍 Deploying with account:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", ethers.utils.formatEther(balance), "ETH\n");

  // Use canonical EntryPoint address
  const ENTRY_POINT_ADDRESS = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
  console.log("📍 Using canonical EntryPoint:", ENTRY_POINT_ADDRESS);

  // Deploy StandardSimpleAccountFactory
  console.log("1️⃣ Deploying StandardSimpleAccountFactory...");
  const StandardSimpleAccountFactory = await ethers.getContractFactory("StandardSimpleAccountFactory");
  const accountFactory = await StandardSimpleAccountFactory.deploy(ENTRY_POINT_ADDRESS);
  await accountFactory.deployed();
  console.log("✅ StandardSimpleAccountFactory deployed to:", accountFactory.address);

  // Deploy NotesRegistry (reuse existing)
  console.log("\n2️⃣ Deploying NotesRegistry...");
  const NotesRegistry = await ethers.getContractFactory("NotesRegistry");
  const notesRegistry = await NotesRegistry.deploy();
  await notesRegistry.deployed();
  console.log("✅ NotesRegistry deployed to:", notesRegistry.address);

  // Deploy NotesPaymaster (reuse existing)
  console.log("\n3️⃣ Deploying NotesPaymaster...");
  const NotesPaymaster = await ethers.getContractFactory("NotesPaymaster");
  const paymaster = await NotesPaymaster.deploy(ENTRY_POINT_ADDRESS);
  await paymaster.deployed();
  console.log("✅ NotesPaymaster deployed to:", paymaster.address);

  // Get current block number
  const blockNumber = await ethers.provider.getBlockNumber();
  
  // Create deployment record
  const deployment = {
    network: "sepolia",
    chainId: 11155111,
    entryPoint: ENTRY_POINT_ADDRESS,
    accountFactory: accountFactory.address,
    notesRegistry: notesRegistry.address,
    paymaster: paymaster.address,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: blockNumber,
    standard: true // Flag to indicate standard contracts
  };

  // Save deployment info
  const deploymentsDir = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir);
  }
  
  fs.writeFileSync(
    path.join(deploymentsDir, 'sepolia-standard.json'),
    JSON.stringify(deployment, null, 2)
  );

  console.log("\n🎉 Standard ERC-4337 Deployment Complete!");
  console.log("📊 Deployment Summary:");
  console.log("   • Network: Sepolia Testnet");
  console.log("   • EntryPoint:", ENTRY_POINT_ADDRESS, "(canonical)");
  console.log("   • AccountFactory:", accountFactory.address, "(standard)");
  console.log("   • NotesRegistry:", notesRegistry.address);
  console.log("   • Paymaster:", paymaster.address);
  console.log("   • Block Number:", blockNumber);
  console.log("   • Deployer:", deployer.address);
  
  console.log("\n🔧 Next Steps:");
  console.log("   1. Update backend .env with new contract addresses");
  console.log("   2. Fund the new paymaster");
  console.log("   3. Test UserOperations with standard contracts");
  console.log("   4. Verify ERC-4337 compatibility");

  // Test account creation
  console.log("\n🧪 Testing StandardSimpleAccountFactory...");
  const testOwner = ethers.Wallet.createRandom().address;
  const testSalt = 0;
  
  try {
    const predictedAddress = await accountFactory.getAddress(testOwner, testSalt);
    console.log("✅ Account address prediction works:", predictedAddress);
  } catch (error) {
    console.log("❌ Account address prediction failed:", error.message);
  }

  console.log("\n✨ Standard ERC-4337 contracts ready for testing!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });