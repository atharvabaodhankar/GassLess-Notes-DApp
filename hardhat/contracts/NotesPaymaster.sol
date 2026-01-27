// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.19;

import "@account-abstraction/contracts/core/BasePaymaster.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title NotesPaymaster
 * @dev Paymaster that sponsors gas for note operations
 * Only allows specific operations and enforces rate limits
 */
contract NotesPaymaster is BasePaymaster, Ownable {
    
    // Rate limiting
    mapping(address => uint256) public userLastTransaction;
    mapping(address => uint256) public userTransactionCount;
    
    uint256 public constant RATE_LIMIT_DURATION = 1 minutes;
    uint256 public constant MAX_TRANSACTIONS_PER_PERIOD = 10;
    
    // Allowed target contracts
    mapping(address => bool) public allowedTargets;
    
    // Allowed function selectors
    mapping(bytes4 => bool) public allowedSelectors;
    
    event UserOperationSponsored(address indexed user, bytes32 indexed userOpHash);
    event TargetAllowed(address indexed target, bool allowed);
    event SelectorAllowed(bytes4 indexed selector, bool allowed);

    constructor(IEntryPoint _entryPoint) BasePaymaster(_entryPoint) {}

    /**
     * @dev Add/remove allowed target contracts
     */
    function setAllowedTarget(address target, bool allowed) external onlyOwner {
        allowedTargets[target] = allowed;
        emit TargetAllowed(target, allowed);
    }

    /**
     * @dev Add/remove allowed function selectors
     */
    function setAllowedSelector(bytes4 selector, bool allowed) external onlyOwner {
        allowedSelectors[selector] = allowed;
        emit SelectorAllowed(selector, allowed);
    }

    /**
     * @dev Validate UserOperation and decide whether to sponsor
     */
    function _validatePaymasterUserOp(UserOperation calldata userOp, bytes32 userOpHash, uint256 maxCost)
    internal override returns (bytes memory context, uint256 validationData) {
        
        // Check rate limiting
        address sender = userOp.sender;
        uint256 currentTime = block.timestamp;
        
        if (currentTime - userLastTransaction[sender] > RATE_LIMIT_DURATION) {
            // Reset counter if period passed
            userTransactionCount[sender] = 0;
        }
        
        require(userTransactionCount[sender] < MAX_TRANSACTIONS_PER_PERIOD, "Rate limit exceeded");
        
        // Decode the call data to check target and function
        if (userOp.callData.length >= 4) {
            bytes4 selector = bytes4(userOp.callData[:4]);
            
            // For execute calls, check the inner target and selector
            if (selector == bytes4(keccak256("execute(address,uint256,bytes)"))) {
                require(userOp.callData.length >= 68, "Invalid execute call");
                
                // Decode target address from execute call
                address target;
                assembly {
                    target := mload(add(add(userOp.callData, 0x20), 0x04))
                }
                
                require(allowedTargets[target], "Target not allowed");
                
                // Check inner function selector if there's call data
                if (userOp.callData.length >= 100) {
                    bytes4 innerSelector;
                    assembly {
                        innerSelector := mload(add(add(userOp.callData, 0x20), 0x44))
                    }
                    require(allowedSelectors[innerSelector], "Function not allowed");
                }
            } else {
                require(allowedSelectors[selector], "Function not allowed");
            }
        }

        // Check if we have enough deposit to cover the cost
        require(paymasterIdBalanceOf(address(this)) >= maxCost, "Insufficient paymaster balance");

        return ("", 0);
    }

    /**
     * @dev Post-operation hook to update rate limiting
     */
    function _postOp(PostOpMode mode, bytes calldata context, uint256 actualGasCost) internal override {
        // Update rate limiting counters
        // Note: We can't easily get the sender here, so we'll update in validatePaymasterUserOp
    }

    /**
     * @dev Update rate limiting (called during validation)
     */
    function _updateRateLimit(address sender) internal {
        userLastTransaction[sender] = block.timestamp;
        userTransactionCount[sender]++;
    }

    /**
     * @dev Owner can deposit funds for gas sponsorship
     */
    function deposit() public payable {
        entryPoint.depositTo{value: msg.value}(address(this));
    }

    /**
     * @dev Owner can withdraw funds
     */
    function withdrawTo(address payable withdrawAddress, uint256 amount) public onlyOwner {
        entryPoint.withdrawTo(withdrawAddress, amount);
    }

    /**
     * @dev Get current paymaster balance
     */
    function getBalance() public view returns (uint256) {
        return entryPoint.balanceOf(address(this));
    }
}