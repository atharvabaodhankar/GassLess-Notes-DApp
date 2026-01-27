const { ethers } = require("hardhat");

async function main() {
  console.log("🚀 Deploying Gasless Notes App Contracts...\n");

  // Get deployer
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", ethers.utils.formatEther(await deployer.getBalance()), "ETH\n");

  // EntryPoint address (standard ERC-4337)
  const ENTRY_POINT_ADDRESS = process.env.ENTRY_POINT_ADDRESS || "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
  console.log("Using EntryPoint:", ENTRY_POINT_ADDRESS);

  // 1. Deploy SimpleAccountFactory
  console.log("📝 Deploying SimpleAccountFactory...");
  const SimpleAccountFactory = await ethers.getContractFactory("SimpleAccountFactory");
  const accountFactory = await SimpleAccountFactory.deploy(ENTRY_POINT_ADDRESS);
  await accountFactory.deployed();
  console.log("✅ SimpleAccountFactory deployed to:", accountFactory.address);

  // 2. Deploy NotesRegistry
  console.log("\n📝 Deploying NotesRegistry...");
  const NotesRegistry = await ethers.getContractFactory("NotesRegistry");
  const notesRegistry = await NotesRegistry.deploy();
  await notesRegistry.deployed();
  console.log("✅ NotesRegistry deployed to:", notesRegistry.address);

  // 3. Deploy NotesPaymaster
  console.log("\n📝 Deploying NotesPaymaster...");
  const NotesPaymaster = await ethers.getContractFactory("NotesPaymaster");
  const paymaster = await NotesPaymaster.deploy(ENTRY_POINT_ADDRESS);
  await paymaster.deployed();
  console.log("✅ NotesPaymaster deployed to:", paymaster.address);

  // 4. Configure Paymaster
  console.log("\n⚙️ Configuring Paymaster...");
  
  // Allow NotesRegistry as target
  await paymaster.setAllowedTarget(notesRegistry.address, true);
  console.log("✅ NotesRegistry added as allowed target");

  // Allow registerNote and updateNote functions
  const registerNoteSelector = ethers.utils.id("registerNote(bytes32,bytes32)").slice(0, 10);
  const updateNoteSelector = ethers.utils.id("updateNote(bytes32,bytes32)").slice(0, 10);
  
  await paymaster.setAllowedSelector(registerNoteSelector, true);
  await paymaster.setAllowedSelector(updateNoteSelector, true);
  console.log("✅ Note functions added as allowed selectors");

  // 5. Fund Paymaster (if on local network)
  if (network.name === "localhost" || network.name === "hardhat") {
    console.log("\n💰 Funding Paymaster for local testing...");
    await paymaster.deposit({ value: ethers.utils.parseEther("1.0") });
    console.log("✅ Paymaster funded with 1 ETH");
  }

  // 6. Create a test account
  console.log("\n🧪 Creating test account...");
  const testOwner = deployer.address;
  const salt = 0;
  
  const testAccount = await accountFactory.createAccount(testOwner, salt);
  const accountAddress = await accountFactory.getAddress(testOwner, salt);
  console.log("✅ Test account created at:", accountAddress);

  // 7. Save deployment info
  const deploymentInfo = {
    network: network.name,
    entryPoint: ENTRY_POINT_ADDRESS,
    accountFactory: accountFactory.address,
    notesRegistry: notesRegistry.address,
    paymaster: paymaster.address,
    testAccount: accountAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString()
  };

  console.log("\n📋 Deployment Summary:");
  console.log("========================");
  console.log(`Network: ${deploymentInfo.network}`);
  console.log(`EntryPoint: ${deploymentInfo.entryPoint}`);
  console.log(`AccountFactory: ${deploymentInfo.accountFactory}`);
  console.log(`NotesRegistry: ${deploymentInfo.notesRegistry}`);
  console.log(`Paymaster: ${deploymentInfo.paymaster}`);
  console.log(`Test Account: ${deploymentInfo.testAccount}`);
  console.log("========================\n");

  // Save to file
  const fs = require('fs');
  fs.writeFileSync(
    `deployments/${network.name}.json`,
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log(`✅ Deployment info saved to deployments/${network.name}.json`);

  console.log("\n🎉 Deployment completed successfully!");
  
  if (network.name === "localhost") {
    console.log("\n🔧 Next steps:");
    console.log("1. Start the backend server");
    console.log("2. Configure backend with these contract addresses");
    console.log("3. Start the frontend application");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });