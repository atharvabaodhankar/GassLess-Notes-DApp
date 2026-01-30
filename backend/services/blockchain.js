const { ethers } = require('ethers');
const crypto = require('crypto');

class BlockchainService {
  constructor() {
    this.provider = new ethers.providers.JsonRpcProvider(process.env.RPC_URL);
    this.wallet = new ethers.Wallet(process.env.PRIVATE_KEY, this.provider);
    
    // Contract addresses (loaded from environment)
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
  }

  /**
   * Get or create smart wallet address for user
   */
  async getWalletAddress(userUid, salt = 0) {
    try {
      // Use user UID as the owner (in practice, you'd derive a proper address)
      const ownerAddress = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(userUid)).slice(0, 42);
      
      // Get counterfactual address
      const walletAddress = await this.accountFactory.getAddress(ownerAddress, salt);
      
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
   * Build UserOperation for note registration
   */
  async buildRegisterNoteUserOp(walletAddress, noteId, noteHash) {
    try {
      // Encode the registerNote call
      const notesRegistryInterface = new ethers.utils.Interface(this.notesRegistryABI);
      const callData = notesRegistryInterface.encodeFunctionData('registerNote', [noteId, noteHash]);
      
      // Encode the execute call for the smart wallet
      const accountInterface = new ethers.utils.Interface(this.simpleAccountABI);
      const executeCallData = accountInterface.encodeFunctionData('execute', [
        this.notesRegistryAddress,
        0, // value
        callData
      ]);

      // Get nonce (simplified - in production, query the actual nonce)
      const nonce = Date.now(); // Temporary nonce

      // Build UserOperation
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
   * Sign UserOperation (simplified version)
   */
  async signUserOperation(userOp, userUid) {
    try {
      // In production, this would be done client-side or with proper key management
      // For demo purposes, we'll create a deterministic signature
      
      const userOpHash = this.getUserOperationHash(userOp);
      const signature = await this.wallet.signMessage(ethers.utils.arrayify(userOpHash));
      
      return {
        ...userOp,
        signature
      };
    } catch (error) {
      console.error('Error signing UserOperation:', error);
      throw new Error('Failed to sign UserOperation');
    }
  }

  /**
   * Submit UserOperation to bundler
   */
  async submitUserOperation(signedUserOp) {
    try {
      // In production, this would call the actual bundler API
      // For demo, we'll simulate the submission
      
      console.log('Submitting UserOperation:', signedUserOp);
      
      // Simulate bundler response
      const userOpHash = this.getUserOperationHash(signedUserOp);
      
      // For local testing, we can directly execute the transaction
      if (process.env.NODE_ENV === 'development') {
        return await this.simulateDirectExecution(signedUserOp);
      }
      
      return {
        userOpHash,
        status: 'pending'
      };
    } catch (error) {
      console.error('Error submitting UserOperation:', error);
      throw new Error('Failed to submit UserOperation');
    }
  }

  /**
   * Simulate direct execution for local testing
   */
  async simulateDirectExecution(userOp) {
    try {
      // Extract the inner call data
      const accountInterface = new ethers.utils.Interface(this.simpleAccountABI);
      const decoded = accountInterface.decodeFunctionData('execute', userOp.callData);
      
      const [target, value, data] = decoded;
      
      // Execute directly on the target contract
      const tx = await this.wallet.sendTransaction({
        to: target,
        value: value,
        data: data,
        gasLimit: 300000
      });
      
      const receipt = await tx.wait();
      
      return {
        userOpHash: this.getUserOperationHash(userOp),
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        status: 'confirmed'
      };
    } catch (error) {
      console.error('Error in direct execution:', error);
      throw error;
    }
  }

  /**
   * Get UserOperation hash
   */
  getUserOperationHash(userOp) {
    // Simplified hash calculation
    const packed = ethers.utils.defaultAbiCoder.encode(
      ['address', 'uint256', 'bytes32', 'bytes32'],
      [
        userOp.sender,
        userOp.nonce,
        ethers.utils.keccak256(userOp.callData),
        ethers.utils.keccak256(userOp.paymasterAndData)
      ]
    );
    
    return ethers.utils.keccak256(packed);
  }

  /**
   * Check transaction status
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
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Error checking transaction status:', error);
      return { status: 'unknown' };
    }
  }
}

module.exports = new BlockchainService();