const { ethers } = require('ethers');
const crypto = require('crypto');

class BlockchainService {
  constructor() {
    // Debug environment variables
    console.log('🔍 Debug - Environment variables:');
    console.log('RPC_URL:', process.env.RPC_URL ? 'Set' : 'Not set');
    console.log('PRIVATE_KEY:', process.env.PRIVATE_KEY ? `Set (${process.env.PRIVATE_KEY.slice(0, 6)}...)` : 'Not set');
    console.log('ENTRY_POINT_ADDRESS:', process.env.ENTRY_POINT_ADDRESS ? 'Set' : 'Not set');
    
    if (!process.env.RPC_URL || !process.env.PRIVATE_KEY) {
      throw new Error('Missing required environment variables: RPC_URL or PRIVATE_KEY');
    }
    
    // Initialize provider and wallet with Sepolia
    this.provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    
    // Contract addresses from deployment
    this.entryPointAddress = process.env.ENTRY_POINT_ADDRESS;
    this.accountFactoryAddress = process.env.ACCOUNT_FACTORY_ADDRESS;
    this.notesRegistryAddress = process.env.NOTES_REGISTRY_ADDRESS;
    this.paymasterAddress = process.env.PAYMASTER_ADDRESS;
    
    // Enhanced Contract ABIs for true ERC-4337
    this.accountFactoryABI = [
      "function createAccount(address owner, uint256 salt) returns (address)",
      "function getAddress(address owner, uint256 salt) view returns (address)"
    ];
    
    this.notesRegistryABI = [
      "function registerNote(bytes32 noteId, bytes32 noteHash)",
      "function updateNote(bytes32 noteId, bytes32 newNoteHash)",
      "function getNote(bytes32 noteId) view returns (bytes32, address, uint256, bool)"
    ];
    
    this.simpleAccountABI = [
      "function execute(address dest, uint256 value, bytes calldata func)",
      "function executeBatch(address[] calldata dest, bytes[] calldata func)",
      "function getNonce() view returns (uint256)",
      "function validateUserOp(tuple(address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature) userOp, bytes32 userOpHash, uint256 missingAccountFunds) external returns (uint256 validationData)"
    ];

    this.entryPointABI = [
      "function handleOps(tuple(address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature)[] calldata ops, address payable beneficiary)",
      "function getUserOpHash(tuple(address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature) calldata userOp) view returns (bytes32)",
      "function getNonce(address sender, uint192 key) view returns (uint256 nonce)"
    ];

    this.paymasterABI = [
      "function validatePaymasterUserOp(tuple(address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature) calldata userOp, bytes32 userOpHash, uint256 maxCost) external view returns (bytes memory context, uint256 validationData)",
      "function postOp(uint8 mode, bytes calldata context, uint256 actualGasCost) external"
    ];

    // Initialize contracts
    this.accountFactory = new ethers.Contract(
      this.accountFactoryAddress, 
      this.accountFactoryABI, 
      this.wallet
    );
    
    this.notesRegistry = new ethers.Contract(
      this.notesRegistryAddress, 
      this.notesRegistryABI, 
      this.wallet
    );

    this.entryPoint = new ethers.Contract(
      this.entryPointAddress,
      this.entryPointABI,
      this.wallet
    );

    this.paymaster = new ethers.Contract(
      this.paymasterAddress,
      this.paymasterABI,
      this.wallet
    );

    // User wallet signing keys cache (in production, use secure key management)
    this.userWalletKeys = new Map();

    console.log('🔗 BlockchainService initialized with TRUE ERC-4337 support');
    console.log('📍 Network:', process.env.RPC_URL);
    console.log('📍 EntryPoint:', this.entryPointAddress);
    console.log('📍 NotesRegistry:', this.notesRegistryAddress);
    console.log('📍 Paymaster:', this.paymasterAddress);
    console.log('🎯 TRUE ERC-4337 MODE: UserOperations will go through EntryPoint WITH PAYMASTER');
  }

  /**
   * Generate or retrieve user's wallet signing key
   */
  getUserWalletKey(userUid) {
    if (!this.userWalletKeys.has(userUid)) {
      // Generate deterministic private key from user UID
      const seed = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(userUid + 'wallet_seed'));
      const privateKey = ethers.utils.keccak256(seed);
      const wallet = new ethers.Wallet(privateKey, this.provider);
      this.userWalletKeys.set(userUid, wallet);
    }
    return this.userWalletKeys.get(userUid);
  }

  /**
   * Get or create smart wallet address for user
   */
  async getWalletAddress(userUid, salt = 0) {
    try {
      // Get user's wallet signing key
      const userWallet = this.getUserWalletKey(userUid);
      const ownerAddress = userWallet.address;
      
      // Get counterfactual address from AccountFactory
      const walletAddress = await this.accountFactory.getAddress(ownerAddress, salt);
      
      console.log(`👛 Smart Wallet for user ${userUid}:`);
      console.log(`   Owner (EOA): ${ownerAddress}`);
      console.log(`   Smart Wallet: ${walletAddress}`);
      
      return {
        walletAddress,
        ownerAddress,
        salt
      };
    } catch (error) {
      console.error('Error getting wallet address:', error);
      throw new Error('Failed to get wallet address');
    }
  }

  /**
   * Check if smart wallet is deployed
   */
  async isWalletDeployed(walletAddress) {
    try {
      const code = await this.provider.getCode(walletAddress);
      return code !== '0x';
    } catch (error) {
      console.error('Error checking wallet deployment:', error);
      return false;
    }
  }

  /**
   * Get nonce for user's smart wallet
   */
  async getUserNonce(walletAddress) {
    try {
      // Get nonce from EntryPoint (key = 0 for default nonce)
      const nonce = await this.entryPoint.getNonce(walletAddress, 0);
      return nonce;
    } catch (error) {
      console.error('Error getting user nonce:', error);
      return ethers.BigNumber.from(0);
    }
  }

  /**
   * Build initCode for wallet deployment if needed
   */
  async buildInitCode(ownerAddress, salt) {
    try {
      const accountFactoryInterface = new ethers.utils.Interface(this.accountFactoryABI);
      const createAccountCall = accountFactoryInterface.encodeFunctionData('createAccount', [ownerAddress, salt]);
      
      // initCode = factory address + createAccount call
      return this.accountFactoryAddress + createAccountCall.slice(2);
    } catch (error) {
      console.error('Error building initCode:', error);
      throw new Error('Failed to build initCode');
    }
  }

  /**
   * TRUE ERC-4337: Register note using UserOperation through EntryPoint WITH PAYMASTER
   */
  async registerNoteOnChain(noteId, noteHash, userUid) {
    try {
      console.log(`🎯 TRUE ERC-4337: Registering note ${noteId} via UserOperation WITH PAYMASTER...`);
      
      // 1. Get user's wallet info
      const { walletAddress, ownerAddress, salt } = await this.getWalletAddress(userUid);
      const userWallet = this.getUserWalletKey(userUid);
      
      // 2. Check if wallet is deployed
      const isDeployed = await this.isWalletDeployed(walletAddress);
      console.log(`📦 Smart wallet deployed: ${isDeployed}`);
      
      // 3. Deploy wallet if needed (REQUIRED for paymaster to work)
      if (!isDeployed) {
        console.log(`🚀 Deploying smart wallet for paymaster compatibility...`);
        const deployTx = await this.accountFactory.createAccount(ownerAddress, salt, {
          gasLimit: 500000
        });
        await deployTx.wait();
        console.log(`✅ Smart wallet deployed: ${walletAddress}`);
      }
      
      // 4. Get current nonce
      const nonce = await this.getUserNonce(walletAddress);
      console.log(`🔢 Current nonce: ${nonce.toString()}`);
      
      // 5. Build the call data
      const noteIdBytes32 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(noteId));
      const noteHashBytes32 = '0x' + noteHash;
      
      // Encode registerNote call
      const notesRegistryInterface = new ethers.utils.Interface(this.notesRegistryABI);
      const registerNoteCall = notesRegistryInterface.encodeFunctionData('registerNote', [noteIdBytes32, noteHashBytes32]);
      
      // Encode execute call for smart wallet
      const accountInterface = new ethers.utils.Interface(this.simpleAccountABI);
      const executeCallData = accountInterface.encodeFunctionData('execute', [
        this.notesRegistryAddress,
        0, // value
        registerNoteCall
      ]);
      
      // 6. Get gas estimates
      const gasPrice = await this.provider.getFeeData();
      
      // 7. Build UserOperation WITH PAYMASTER (wallet already deployed)
      const userOp = {
        sender: walletAddress,
        nonce: ethers.utils.hexlify(nonce),
        initCode: '0x', // Wallet already deployed
        callData: executeCallData,
        callGasLimit: ethers.utils.hexlify(200000),
        verificationGasLimit: ethers.utils.hexlify(100000),
        preVerificationGas: ethers.utils.hexlify(21000),
        maxFeePerGas: ethers.utils.hexlify(gasPrice.maxFeePerGas || ethers.utils.parseUnits('20', 'gwei')),
        maxPriorityFeePerGas: ethers.utils.hexlify(gasPrice.maxPriorityFeePerGas || ethers.utils.parseUnits('2', 'gwei')),
        paymasterAndData: this.paymasterAddress, // Paymaster sponsors gas
        signature: '0x' // Will be filled after signing
      };
      
      console.log(`🔧 UserOperation built (WITH PAYMASTER):`, {
        sender: userOp.sender,
        nonce: userOp.nonce,
        initCodeLength: userOp.initCode.length,
        callDataLength: userOp.callData.length,
        paymasterAndData: userOp.paymasterAndData
      });
      
      // 8. Get UserOperation hash from EntryPoint
      const userOpHash = await this.entryPoint.getUserOpHash(userOp);
      console.log(`🔐 UserOpHash: ${userOpHash}`);
      
      // 9. Sign UserOperation hash with user's wallet key
      const signature = await userWallet.signMessage(ethers.utils.arrayify(userOpHash));
      userOp.signature = signature;
      
      console.log(`✍️  UserOperation signed by user wallet: ${userWallet.address}`);
      console.log(`🔐 Signature: ${signature.slice(0, 20)}...`);
      
      // 10. Submit UserOperation to EntryPoint WITH PAYMASTER
      console.log(`🚀 Submitting UserOperation to EntryPoint (WITH PAYMASTER)...`);
      console.log(`💰 Paymaster will sponsor all gas fees - zero cost to user!`);
      
      const tx = await this.entryPoint.handleOps([userOp], this.wallet.address, {
        gasLimit: 1000000 // High gas limit for EntryPoint execution
      });
      
      console.log(`📝 EntryPoint transaction sent: ${tx.hash}`);
      
      // 11. Wait for confirmation
      const receipt = await tx.wait();
      
      if (receipt.status === 1) {
        console.log(`✅ TRUE ERC-4337 SUCCESS (WITH PAYMASTER)!`);
        console.log(`   Transaction: ${receipt.transactionHash}`);
        console.log(`   Block: ${receipt.blockNumber}`);
        console.log(`   Gas Used: ${receipt.gasUsed.toString()}`);
        console.log(`   Smart Wallet: ${walletAddress}`);
        console.log(`   Paymaster: ${this.paymasterAddress}`);
        console.log(`   🎉 PURE GASLESS EXPERIENCE ACHIEVED!`);
        
        return {
          transactionHash: receipt.transactionHash,
          blockNumber: receipt.blockNumber,
          status: 'confirmed',
          gasUsed: receipt.gasUsed.toString(),
          userOpHash: userOpHash,
          smartWallet: walletAddress,
          isWalletDeployed: !isDeployed,
          erc4337: true,
          paymasterUsed: true,
          gasless: true
        };
      } else {
        throw new Error('Transaction failed with status 0');
      }
      
    } catch (error) {
      console.error('❌ TRUE ERC-4337 Error:', error.message);
      
      // Fallback to direct registration if UserOperation fails
      console.log('🔄 Falling back to direct registration...');
      return await this.registerNoteDirectly(noteId, noteHash, userUid);
    }
  }

  /**
   * Fallback: Direct registration (old method)
   */
  async registerNoteDirectly(noteId, noteHash, userUid) {
    try {
      console.log(`🔄 FALLBACK: Direct registration for note ${noteId}...`);
      
      const noteIdBytes32 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(noteId));
      const noteHashBytes32 = '0x' + noteHash;
      
      const tx = await this.notesRegistry.registerNote(noteIdBytes32, noteHashBytes32, {
        gasLimit: 200000,
        maxFeePerGas: ethers.utils.parseUnits('20', 'gwei'),
        maxPriorityFeePerGas: ethers.utils.parseUnits('2', 'gwei')
      });
      
      const receipt = await tx.wait();
      
      console.log(`✅ Fallback registration successful: ${receipt.transactionHash}`);
      
      return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        status: 'confirmed',
        gasUsed: receipt.gasUsed.toString(),
        erc4337: false // Flag to indicate fallback method
      };
      
    } catch (error) {
      console.error('❌ Fallback registration failed:', error);
      return {
        status: 'failed',
        error: error.message,
        erc4337: false
      };
    }
  }

  /**
   * Check transaction status on Sepolia
   */
  async checkTransactionStatus(transactionHash) {
    try {
      const receipt = await this.provider.getTransactionReceipt(transactionHash);
      
      if (!receipt) {
        return { status: 'pending' };
      }
      
      return {
        status: receipt.status === 1 ? 'confirmed' : 'failed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        confirmations: await receipt.confirmations()
      };
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return { status: 'unknown', error: error.message };
    }
  }

  /**
   * Verify note integrity on blockchain
   */
  async verifyNoteOnChain(noteId, expectedHash) {
    try {
      const noteIdBytes32 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(noteId));
      const [noteHash, owner, timestamp, exists] = await this.notesRegistry.getNote(noteIdBytes32);
      
      if (!exists) {
        return { verified: false, reason: 'Note not found on blockchain' };
      }
      
      const expectedHashBytes32 = '0x' + expectedHash;
      const verified = noteHash === expectedHashBytes32;
      
      return {
        verified,
        onChainHash: noteHash,
        expectedHash: expectedHashBytes32,
        owner,
        timestamp: timestamp.toString(),
        blockchainData: { noteHash, owner, timestamp, exists }
      };
      
    } catch (error) {
      console.error('Error verifying note on chain:', error);
      return { verified: false, error: error.message };
    }
  }

  /**
   * Get network info with ERC-4337 status
   */
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getFeeData();
      
      // Check EntryPoint status
      const entryPointCode = await this.provider.getCode(this.entryPointAddress);
      const isEntryPointDeployed = entryPointCode !== '0x';
      
      // Check Paymaster balance
      const paymasterBalance = await this.provider.getBalance(this.paymasterAddress);
      
      return {
        chainId: network.chainId.toString(),
        name: network.name,
        blockNumber,
        gasPrice: {
          maxFeePerGas: gasPrice.maxFeePerGas?.toString(),
          maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas?.toString()
        },
        erc4337: {
          entryPointDeployed: isEntryPointDeployed,
          paymasterBalance: ethers.utils.formatEther(paymasterBalance),
          mode: 'TRUE_ERC4337'
        }
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      throw error;
    }
  }

  /**
   * Get user's smart wallet info and deployment status
   */
  async getWalletInfo(userUid) {
    try {
      const { walletAddress, ownerAddress, salt } = await this.getWalletAddress(userUid);
      const isDeployed = await this.isWalletDeployed(walletAddress);
      const nonce = await this.getUserNonce(walletAddress);
      
      let balance = ethers.BigNumber.from(0);
      if (isDeployed) {
        balance = await this.provider.getBalance(walletAddress);
      }
      
      return {
        smartWallet: walletAddress,
        owner: ownerAddress,
        salt,
        isDeployed,
        nonce: nonce.toString(),
        balance: ethers.utils.formatEther(balance),
        erc4337: true
      };
    } catch (error) {
      console.error('Error getting wallet info:', error);
      throw error;
    }
  }

  /**
   * Fund user's smart wallet with ETH for gas
   */
  async fundUserWallet(userUid, amountEth = '0.01') {
    try {
      const { walletAddress } = await this.getWalletAddress(userUid);
      
      console.log(`💰 Funding smart wallet ${walletAddress} with ${amountEth} ETH...`);
      
      const tx = await this.wallet.sendTransaction({
        to: walletAddress,
        value: ethers.utils.parseEther(amountEth),
        gasLimit: 21000
      });
      
      const receipt = await tx.wait();
      
      console.log(`✅ Smart wallet funded!`);
      console.log(`   Transaction: ${receipt.transactionHash}`);
      console.log(`   Amount: ${amountEth} ETH`);
      
      return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        amount: amountEth,
        walletAddress
      };
      
    } catch (error) {
      console.error('Error funding user wallet:', error);
      throw error;
    }
  }

  /**
   * Deploy user's smart wallet if not already deployed
   */
  async deployUserWallet(userUid) {
    try {
      const { walletAddress, ownerAddress, salt } = await this.getWalletAddress(userUid);
      const isDeployed = await this.isWalletDeployed(walletAddress);
      
      if (isDeployed) {
        console.log(`✅ Wallet already deployed: ${walletAddress}`);
        return { walletAddress, alreadyDeployed: true };
      }
      
      console.log(`🚀 Deploying smart wallet for user ${userUid}...`);
      
      const tx = await this.accountFactory.createAccount(ownerAddress, salt, {
        gasLimit: 500000
      });
      
      const receipt = await tx.wait();
      
      console.log(`✅ Smart wallet deployed: ${walletAddress}`);
      console.log(`   Transaction: ${receipt.transactionHash}`);
      console.log(`   Block: ${receipt.blockNumber}`);
      
      return {
        walletAddress,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        alreadyDeployed: false
      };
      
    } catch (error) {
      console.error('Error deploying user wallet:', error);
      throw error;
    }
  }

  /**
   * Estimate gas for UserOperation
   */
  async estimateUserOpGas(userOp) {
    try {
      // This is a simplified estimation
      // In production, you'd use eth_estimateUserOperationGas
      
      const baseGas = 21000; // Base transaction gas
      const callDataGas = Math.ceil(userOp.callData.length / 2) * 16; // Rough estimate
      const initCodeGas = userOp.initCode !== '0x' ? 200000 : 0; // Deployment gas
      
      const estimatedGas = baseGas + callDataGas + initCodeGas + 100000; // Buffer
      
      return {
        callGasLimit: Math.max(200000, estimatedGas),
        verificationGasLimit: userOp.initCode !== '0x' ? 500000 : 150000,
        preVerificationGas: 50000
      };
    } catch (error) {
      console.error('Error estimating UserOp gas:', error);
      return {
        callGasLimit: 300000,
        verificationGasLimit: 200000,
        preVerificationGas: 50000
      };
    }
  }
}

module.exports = new BlockchainService();