const dotenv = require('dotenv');
dotenv.config();

const { ethers } = require('ethers');

async function implementPaymasterFlow() {
  console.log('🎯 Implementing Working Paymaster ERC-4337 Flow...\n');
  
  try {
    // Initialize provider and wallet
    const provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    
    const entryPointAddress = process.env.ENTRY_POINT_ADDRESS;
    const paymasterAddress = process.env.PAYMASTER_ADDRESS;
    const accountFactoryAddress = process.env.ACCOUNT_FACTORY_ADDRESS;
    const notesRegistryAddress = process.env.NOTES_REGISTRY_ADDRESS;
    
    console.log('📍 Configuration:');
    console.log('   EntryPoint:', entryPointAddress);
    console.log('   Paymaster:', paymasterAddress);
    console.log('   AccountFactory:', accountFactoryAddress);
    console.log('   NotesRegistry:', notesRegistryAddress);
    
    // Create test user
    const testUserId = 'paymaster_test_' + Date.now();
    const userSeed = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(testUserId + 'wallet_seed'));
    const userPrivateKey = ethers.utils.keccak256(userSeed);
    const userWallet = new ethers.Wallet(userPrivateKey, provider);
    
    console.log('\n1️⃣ Test User Setup:');
    console.log('   User ID:', testUserId);
    console.log('   User Wallet:', userWallet.address);
    
    // Get smart wallet address
    const accountFactoryABI = [
      "function getAddress(address owner, uint256 salt) view returns (address)",
      "function createAccount(address owner, uint256 salt) returns (address)"
    ];
    const accountFactory = new ethers.Contract(accountFactoryAddress, accountFactoryABI, wallet);
    const smartWalletAddress = await accountFactory.getAddress(userWallet.address, 0);
    
    console.log('   Smart Wallet:', smartWalletAddress);
    
    // Check if smart wallet is deployed
    const smartWalletCode = await provider.getCode(smartWalletAddress);
    const isDeployed = smartWalletCode !== '0x';
    console.log('   Deployed:', isDeployed);
    
    // Deploy smart wallet if needed
    if (!isDeployed) {
      console.log('\n2️⃣ Deploying Smart Wallet...');
      const deployTx = await accountFactory.createAccount(userWallet.address, 0, {
        gasLimit: 500000
      });
      const deployReceipt = await deployTx.wait();
      console.log('   ✅ Smart wallet deployed!');
      console.log('   Transaction:', deployReceipt.transactionHash);
    }
    
    // Now implement paymaster-sponsored note registration
    console.log('\n3️⃣ Paymaster-Sponsored Note Registration...');
    
    const noteId = `paymaster_note_${Date.now()}`;
    const noteHash = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('Paymaster sponsored note')).slice(2);
    
    console.log('   Note ID:', noteId);
    console.log('   Note Hash:', noteHash);
    
    // Build note registration call
    const noteIdBytes32 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(noteId));
    const noteHashBytes32 = '0x' + noteHash;
    
    const notesRegistryABI = [
      "function registerNote(bytes32 noteId, bytes32 noteHash)"
    ];
    const notesRegistryInterface = new ethers.utils.Interface(notesRegistryABI);
    const registerNoteCall = notesRegistryInterface.encodeFunctionData('registerNote', [noteIdBytes32, noteHashBytes32]);
    
    // Build execute call for smart wallet
    const simpleAccountABI = [
      "function execute(address dest, uint256 value, bytes calldata func)"
    ];
    const accountInterface = new ethers.utils.Interface(simpleAccountABI);
    const executeCallData = accountInterface.encodeFunctionData('execute', [
      notesRegistryAddress,
      0, // value
      registerNoteCall
    ]);
    
    // Get nonce
    const entryPointABI = [
      "function getNonce(address sender, uint192 key) view returns (uint256 nonce)",
      "function getUserOpHash(tuple(address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature) calldata userOp) view returns (bytes32)",
      "function handleOps(tuple(address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature)[] calldata ops, address payable beneficiary)"
    ];
    const entryPoint = new ethers.Contract(entryPointAddress, entryPointABI, wallet);
    const nonce = await entryPoint.getNonce(smartWalletAddress, 0);
    
    console.log('   Current nonce:', nonce.toString());
    
    // Build UserOperation WITH paymaster
    const gasPrice = await provider.getFeeData();
    const userOp = {
      sender: smartWalletAddress,
      nonce: ethers.utils.hexlify(nonce),
      initCode: '0x', // Wallet already deployed
      callData: executeCallData,
      callGasLimit: ethers.utils.hexlify(200000),
      verificationGasLimit: ethers.utils.hexlify(100000),
      preVerificationGas: ethers.utils.hexlify(21000),
      maxFeePerGas: ethers.utils.hexlify(gasPrice.maxFeePerGas || ethers.utils.parseUnits('20', 'gwei')),
      maxPriorityFeePerGas: ethers.utils.hexlify(gasPrice.maxPriorityFeePerGas || ethers.utils.parseUnits('2', 'gwei')),
      paymasterAndData: paymasterAddress, // Simple paymaster address
      signature: '0x'
    };
    
    console.log('   UserOperation built with paymaster:', paymasterAddress);
    
    // Get UserOpHash and sign
    const userOpHash = await entryPoint.getUserOpHash(userOp);
    console.log('   UserOpHash:', userOpHash);
    
    // Sign with user wallet (as Ethereum message for SimpleAccount)
    const signature = await userWallet.signMessage(ethers.utils.arrayify(userOpHash));
    userOp.signature = signature;
    
    console.log('   Signature created:', signature.slice(0, 20) + '...');
    
    // Submit to EntryPoint
    console.log('\n4️⃣ Submitting to EntryPoint...');
    
    try {
      const tx = await entryPoint.handleOps([userOp], wallet.address, {
        gasLimit: 1000000
      });
      
      console.log('   Transaction sent:', tx.hash);
      const receipt = await tx.wait();
      
      console.log('\n🎉 PAYMASTER SUCCESS!');
      console.log('   Transaction:', receipt.transactionHash);
      console.log('   Block:', receipt.blockNumber);
      console.log('   Gas Used:', receipt.gasUsed.toString());
      console.log('   Status:', receipt.status === 1 ? 'SUCCESS' : 'FAILED');
      
      if (receipt.status === 1) {
        console.log('\n✅ Pure ERC-4337 with Paymaster Working!');
        console.log('   • Smart wallet deployed and funded by paymaster');
        console.log('   • Note registered through UserOperation');
        console.log('   • Zero ETH required from user');
        console.log('   • True gasless experience achieved');
      }
      
    } catch (error) {
      console.log('\n❌ EntryPoint execution failed:', error.message);
      
      // Try without paymaster to isolate the issue
      console.log('\n🔄 Trying without paymaster...');
      
      const userOpNoPaymaster = {
        ...userOp,
        paymasterAndData: '0x'
      };
      
      // Re-sign without paymaster
      const userOpHashNoPaymaster = await entryPoint.getUserOpHash(userOpNoPaymaster);
      const signatureNoPaymaster = await userWallet.signMessage(ethers.utils.arrayify(userOpHashNoPaymaster));
      userOpNoPaymaster.signature = signatureNoPaymaster;
      
      // Fund smart wallet first
      console.log('   Funding smart wallet with 0.01 ETH...');
      const fundTx = await wallet.sendTransaction({
        to: smartWalletAddress,
        value: ethers.utils.parseEther('0.01'),
        gasLimit: 21000
      });
      await fundTx.wait();
      console.log('   Smart wallet funded');
      
      try {
        const txNoPaymaster = await entryPoint.handleOps([userOpNoPaymaster], wallet.address, {
          gasLimit: 1000000
        });
        
        const receiptNoPaymaster = await txNoPaymaster.wait();
        console.log('   ✅ UserOperation works without paymaster');
        console.log('   Transaction:', receiptNoPaymaster.transactionHash);
        console.log('   → Issue is specifically with paymaster validation');
        
      } catch (error2) {
        console.log('   ❌ UserOperation fails even without paymaster:', error2.message);
        console.log('   → Issue is with UserOperation structure or smart wallet compatibility');
      }
    }
    
  } catch (error) {
    console.error('❌ Implementation failed:', error.message);
    console.error('Stack:', error.stack);
  }
}

implementPaymasterFlow();