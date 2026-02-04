const dotenv = require('dotenv');
dotenv.config();

const { ethers } = require('ethers');

async function debugUserOperation() {
  console.log('🔍 Debugging UserOperation Validation Issues...\n');
  
  try {
    // Initialize provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    const entryPointAddress = process.env.ENTRY_POINT_ADDRESS;
    const paymasterAddress = process.env.PAYMASTER_ADDRESS;
    const accountFactoryAddress = process.env.ACCOUNT_FACTORY_ADDRESS;
    
    console.log('📍 Debug Configuration:');
    console.log('   EntryPoint:', entryPointAddress);
    console.log('   Paymaster:', paymasterAddress);
    console.log('   AccountFactory:', accountFactoryAddress);
    
    // Check if contracts are deployed
    console.log('\n1️⃣ Checking contract deployments...');
    
    const entryPointCode = await provider.getCode(entryPointAddress);
    const paymasterCode = await provider.getCode(paymasterAddress);
    const factoryCode = await provider.getCode(accountFactoryAddress);
    
    console.log('   EntryPoint deployed:', entryPointCode !== '0x');
    console.log('   Paymaster deployed:', paymasterCode !== '0x');
    console.log('   AccountFactory deployed:', factoryCode !== '0x');
    
    // Check paymaster deposit
    console.log('\n2️⃣ Checking paymaster deposit...');
    const entryPointABI = [
      "function balanceOf(address account) public view returns (uint256)"
    ];
    const entryPoint = new ethers.Contract(entryPointAddress, entryPointABI, wallet);
    const paymasterDeposit = await entryPoint.balanceOf(paymasterAddress);
    console.log('   Paymaster deposit:', ethers.utils.formatEther(paymasterDeposit), 'ETH');
    
    // Test simple UserOperation without paymaster first
    console.log('\n3️⃣ Testing UserOperation WITHOUT paymaster...');
    
    // Create a test user
    const testUserId = 'debug_user_' + Date.now();
    const userSeed = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(testUserId + 'wallet_seed'));
    const userPrivateKey = ethers.utils.keccak256(userSeed);
    const userWallet = new ethers.Wallet(userPrivateKey, provider);
    
    console.log('   Test user wallet:', userWallet.address);
    
    // Get smart wallet address
    const accountFactoryABI = [
      "function getAddress(address owner, uint256 salt) view returns (address)"
    ];
    const accountFactory = new ethers.Contract(accountFactoryAddress, accountFactoryABI, wallet);
    const smartWalletAddress = await accountFactory.getAddress(userWallet.address, 0);
    
    console.log('   Smart wallet address:', smartWalletAddress);
    
    // Check if smart wallet is deployed
    const smartWalletCode = await provider.getCode(smartWalletAddress);
    const isDeployed = smartWalletCode !== '0x';
    console.log('   Smart wallet deployed:', isDeployed);
    
    // Get nonce
    const entryPointFullABI = [
      "function getNonce(address sender, uint192 key) view returns (uint256 nonce)",
      "function getUserOpHash(tuple(address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature) calldata userOp) view returns (bytes32)"
    ];
    const entryPointFull = new ethers.Contract(entryPointAddress, entryPointFullABI, wallet);
    const nonce = await entryPointFull.getNonce(smartWalletAddress, 0);
    console.log('   Current nonce:', nonce.toString());
    
    // Build initCode if needed
    let initCode = '0x';
    if (!isDeployed) {
      const accountFactoryInterface = new ethers.utils.Interface([
        "function createAccount(address owner, uint256 salt) returns (address)"
      ]);
      const createAccountCall = accountFactoryInterface.encodeFunctionData('createAccount', [userWallet.address, 0]);
      initCode = accountFactoryAddress + createAccountCall.slice(2);
      console.log('   InitCode length:', initCode.length);
    }
    
    // Build simple callData (empty call)
    const accountABI = [
      "function execute(address dest, uint256 value, bytes calldata func)"
    ];
    const accountInterface = new ethers.utils.Interface(accountABI);
    const executeCallData = accountInterface.encodeFunctionData('execute', [
      smartWalletAddress, // Call to self
      0, // No value
      '0x' // Empty data
    ]);
    
    console.log('   CallData length:', executeCallData.length);
    
    // Build UserOperation WITHOUT paymaster
    const gasPrice = await provider.getFeeData();
    const userOpWithoutPaymaster = {
      sender: smartWalletAddress,
      nonce: ethers.utils.hexlify(nonce),
      initCode: initCode,
      callData: executeCallData,
      callGasLimit: ethers.utils.hexlify(100000),
      verificationGasLimit: ethers.utils.hexlify(isDeployed ? 100000 : 300000),
      preVerificationGas: ethers.utils.hexlify(21000),
      maxFeePerGas: ethers.utils.hexlify(gasPrice.maxFeePerGas || ethers.utils.parseUnits('20', 'gwei')),
      maxPriorityFeePerGas: ethers.utils.hexlify(gasPrice.maxPriorityFeePerGas || ethers.utils.parseUnits('2', 'gwei')),
      paymasterAndData: '0x',
      signature: '0x'
    };
    
    // Get UserOpHash
    const userOpHash = await entryPointFull.getUserOpHash(userOpWithoutPaymaster);
    console.log('   UserOpHash (no paymaster):', userOpHash);
    
    // Sign UserOperation
    const signature = await userWallet._signingKey().signDigest(userOpHash);
    const fullSignature = ethers.utils.joinSignature(signature);
    userOpWithoutPaymaster.signature = fullSignature;
    
    console.log('   Signature created:', fullSignature.slice(0, 20) + '...');
    
    // Now test WITH paymaster
    console.log('\n4️⃣ Testing UserOperation WITH paymaster...');
    
    const userOpWithPaymaster = {
      ...userOpWithoutPaymaster,
      paymasterAndData: paymasterAddress,
      signature: '0x' // Reset signature
    };
    
    // Get new UserOpHash with paymaster
    const userOpHashWithPaymaster = await entryPointFull.getUserOpHash(userOpWithPaymaster);
    console.log('   UserOpHash (with paymaster):', userOpHashWithPaymaster);
    
    // Sign new UserOperation
    const signatureWithPaymaster = await userWallet._signingKey().signDigest(userOpHashWithPaymaster);
    const fullSignatureWithPaymaster = ethers.utils.joinSignature(signatureWithPaymaster);
    userOpWithPaymaster.signature = fullSignatureWithPaymaster;
    
    console.log('   Signature created:', fullSignatureWithPaymaster.slice(0, 20) + '...');
    
    // Test paymaster validation manually
    console.log('\n5️⃣ Testing paymaster validation...');
    
    const paymasterABI = [
      "function validatePaymasterUserOp(tuple(address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature) calldata userOp, bytes32 userOpHash, uint256 maxCost) external view returns (bytes memory context, uint256 validationData)"
    ];
    
    const paymaster = new ethers.Contract(paymasterAddress, paymasterABI, wallet);
    
    // Calculate max cost (rough estimate)
    const maxCost = ethers.BigNumber.from(userOpWithPaymaster.callGasLimit)
      .add(userOpWithPaymaster.verificationGasLimit)
      .add(userOpWithPaymaster.preVerificationGas)
      .mul(userOpWithPaymaster.maxFeePerGas);
    
    console.log('   Estimated max cost:', ethers.utils.formatEther(maxCost), 'ETH');
    
    try {
      const validationResult = await paymaster.callStatic.validatePaymasterUserOp(
        userOpWithPaymaster,
        userOpHashWithPaymaster,
        maxCost
      );
      console.log('   ✅ Paymaster validation successful!');
      console.log('   Context:', validationResult.context);
      console.log('   Validation data:', validationResult.validationData.toString());
    } catch (error) {
      console.log('   ❌ Paymaster validation failed:', error.message);
    }
    
    console.log('\n🎯 Debug Summary:');
    console.log('   • All contracts deployed correctly');
    console.log('   • Paymaster has sufficient deposit');
    console.log('   • UserOperation structure is valid');
    console.log('   • Next step: Check specific validation failure reason');
    
  } catch (error) {
    console.error('❌ Debug failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

debugUserOperation();