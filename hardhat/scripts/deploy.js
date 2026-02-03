const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Gasless Notes App Contracts to Sepolia...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

  // EntryPoint address (standard ERC-4337)
  const ENTRY_POINT_ADDRESS = process.env.ENTRY_POINT_ADDRESS || "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
  console.log("Using EntryPoint:", ENTRY_POINT_ADDRESS);

  // 1. Deploy SimpleAccountFactory
  console.log("📝 Deploying SimpleAccountFactory...");
  const SimpleAccountFactory = await ethers.getContractFactory("SimpleAccountFactory");
  const accountFactory = await SimpleAccountFactory.deploy(ENTRY_POINT_ADDRESS);
  await accountFactory.waitForDeployment();
  const accountFactoryAddress = await accountFactory.getAddress();
  console.log("✅ SimpleAccountFactory deployed to:", accountFactoryAddress);

  // 2. Deploy NotesRegistry
  console.log("\n📝 Deploying NotesRegistry...");
  const NotesRegistry = await ethers.getContractFactory("NotesRegistry");
  const notesRegistry = await NotesRegistry.deploy(deployer.address);
  await notesRegistry.waitForDeployment();
  const notesRegistryAddress = await notesRegistry.getAddress();
  console.log("✅ NotesRegistry deployed to:", notesRegistryAddress);

  // 3. Deploy NotesPaymaster
  console.log("\n📝 Deploying NotesPaymaster...");
  const NotesPaymaster = await ethers.getContractFactory("NotesPaymaster");
  const paymaster = await NotesPaymaster.deploy(ENTRY_POINT_ADDRESS);
  await paymaster.waitForDeployment();
  const paymasterAddress = await paymaster.getAddress();
  console.log("✅ NotesPaymaster deployed to:", paymasterAddress);

  // 4. Fund Paymaster with 0.1 ETH
  console.log("\n💰 Funding Paymaster...");
  const fundTx = await paymaster.fundPaymaster({ value: ethers.parseEther("0.1") });
  await fundTx.wait();
  console.log("✅ Paymaster funded with 0.1 ETH");

  // 5. Create a test account
  console.log("\n🧪 Creating test account...");
  const testOwner = deployer.address;
  const salt = 0;
  
  const createTx = await accountFactory.createAccount(testOwner, salt);
  await createTx.wait();
  const accountAddress = await accountFactory.getAddress(testOwner, salt);
  console.log("✅ Test account created at:", accountAddress);

  // 6. Save deployment info
  const deploymentInfo = {
    network: "sepolia",
    chainId: 11155111,
    entryPoint: ENTRY_POINT_ADDRESS,
    accountFactory: accountFactoryAddress,
    notesRegistry: notesRegistryAddress,
    paymaster: paymasterAddress,
    testAccount: accountAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    blockNumber: await ethers.provider.getBlockNumber()
  };

  console.log("\n📋 Deployment Summary:");
  console.log("========================");
  console.log(`Network: ${deploymentInfo.network}`);
  console.log(`Chain ID: ${deploymentInfo.chainId}`);
  console.log(`EntryPoint: ${deploymentInfo.entryPoint}`);
  console.log(`AccountFactory: ${deploymentInfo.accountFactory}`);
  console.log(`NotesRegistry: ${deploymentInfo.notesRegistry}`);
  console.log(`Paymaster: ${deploymentInfo.paymaster}`);
  console.log(`Test Account: ${deploymentInfo.testAccount}`);
  console.log(`Block Number: ${deploymentInfo.blockNumber}`);
  console.log("========================\n");

  // Save to file
  const fs = require('fs');
  if (!fs.existsSync('deployments')) {
    fs.mkdirSync('deployments');
  }
  fs.writeFileSync(
    'deployments/sepolia.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`✅ Deployment info saved to deployments/sepolia.json`);

  console.log("\n🎉 Sepolia Deployment completed successfully!");
  console.log("\n🔧 Next steps:");
  console.log("1. Update backend .env with these contract addresses");
  console.log("2. Test the real ERC-4337 integration");
  console.log("3. Replace mock verification with real blockchain calls");
  
  console.log("\n📝 Contract Addresses for Backend:");
  console.log(`ENTRY_POINT_ADDRESS=${ENTRY_POINT_ADDRESS}`);
  console.log(`ACCOUNT_FACTORY_ADDRESS=${accountFactoryAddress}`);
  console.log(`NOTES_REGISTRY_ADDRESS=${notesRegistryAddress}`);
  console.log(`PAYMASTER_ADDRESS=${paymasterAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });