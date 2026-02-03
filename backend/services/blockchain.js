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
    
    // Contract ABIs (simplified for key functions)
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
      "function getNonce() view returns (uint256)"
    ];

    this.entryPointABI = [
      "function handleOps(tuple(address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature)[] calldata ops, address payable beneficiary)",
      "function getUserOpHash(tuple(address sender, uint256 nonce, bytes initCode, bytes callData, uint256 callGasLimit, uint256 verificationGasLimit, uint256 preVerificationGas, uint256 maxFeePerGas, uint256 maxPriorityFeePerGas, bytes paymasterAndData, bytes signature) calldata userOp) view returns (bytes32)"
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

    console.log('🔗 BlockchainService initialized with Sepolia contracts');
    console.log('📍 Network:', process.env.RPC_URL);
    console.log('📍 EntryPoint:', this.entryPointAddress);
    console.log('📍 NotesRegistry:', this.notesRegistryAddress);
    console.log('📍 Paymaster:', this.paymasterAddress);
  }

  /**
   * Get or create smart wallet address for user
   */
  async getWalletAddress(userUid, salt = 0) {
    try {
      // Create deterministic owner address from user UID
      const ownerAddress = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(userUid)).slice(0, 42);
      
      // Get counterfactual address
      const walletAddress = await this.accountFactory.getAddress(ownerAddress, salt);
      
      console.log(`👛 Wallet for user ${userUid}: ${walletAddress}`);
      
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
   * Register note on blockchain using direct contract call (simplified for now)
   */
  async registerNoteOnChain(noteId, noteHash, userUid) {
    try {
      console.log(`🔗 Registering note ${noteId} on Sepolia blockchain...`);
      
      // Convert to bytes32
      const noteIdBytes32 = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(noteId));
      const noteHashBytes32 = '0x' + noteHash;
      
      // For now, register directly (later we'll use UserOperations)
      const tx = await this.notesRegistry.registerNote(noteIdBytes32, noteHashBytes32, {
        gasLimit: 200000,
        maxFeePerGas: ethers.utils.parseUnits('20', 'gwei'),
        maxPriorityFeePerGas: ethers.utils.parseUnits('2', 'gwei')
      });
      
      console.log(`📝 Transaction sent: ${tx.hash}`);
      
      // Wait for confirmation
      const receipt = await tx.wait();
      
      console.log(`✅ Note registered! Block: ${receipt.blockNumber}`);
      
      return {
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        status: 'confirmed',
        gasUsed: receipt.gasUsed.toString()
      };
      
    } catch (error) {
      console.error('Error registering note on chain:', error);
      return {
        status: 'failed',
        error: error.message
      };
    }
  }

  /**
   * Build UserOperation for note registration (for future ERC-4337 integration)
   */
  async buildRegisterNoteUserOp(walletAddress, noteId, noteHash) {
    try {
      console.log(`🔧 Building UserOperation for ${walletAddress}...`);
      
      // Encode the registerNote call
      const notesRegistryInterface = new ethers.Interface(this.notesRegistryABI);
      const callData = notesRegistryInterface.encodeFunctionData('registerNote', [noteId, noteHash]);
      
      // Encode the execute call for the smart wallet
      const accountInterface = new ethers.Interface(this.simpleAccountABI);
      const executeCallData = accountInterface.encodeFunctionData('execute', [
        this.notesRegistryAddress,
        0, // value
        callData
      ]);

      // Get current nonce (simplified)
      const nonce = Date.now();

      // Build UserOperation structure
      const userOp = {
        sender: walletAddress,
        nonce: ethers.utils.hexlify(nonce),
        initCode: '0x', // Assume wallet is already deployed
        callData: executeCallData,
        callGasLimit: ethers.utils.hexlify(200000),
        verificationGasLimit: ethers.utils.hexlify(150000),
        preVerificationGas: ethers.utils.hexlify(50000),
        maxFeePerGas: ethers.utils.hexlify(ethers.utils.parseUnits('20', 'gwei')),
        maxPriorityFeePerGas: ethers.utils.hexlify(ethers.utils.parseUnits('2', 'gwei')),
        paymasterAndData: this.paymasterAddress + '0'.repeat(40), // Simplified paymaster data
        signature: '0x' // Will be filled by signing
      };

      return userOp;
    } catch (error) {
      console.error('Error building UserOperation:', error);
      throw new Error('Failed to build UserOperation');
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
   * Get network info
   */
  async getNetworkInfo() {
    try {
      const network = await this.provider.getNetwork();
      const blockNumber = await this.provider.getBlockNumber();
      const gasPrice = await this.provider.getFeeData();
      
      return {
        chainId: network.chainId.toString(),
        name: network.name,
        blockNumber,
        gasPrice: {
          maxFeePerGas: gasPrice.maxFeePerGas?.toString(),
          maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas?.toString()
        }
      };
    } catch (error) {
      console.error('Error getting network info:', error);
      throw error;
    }
  }
}

module.exports = new BlockchainService();