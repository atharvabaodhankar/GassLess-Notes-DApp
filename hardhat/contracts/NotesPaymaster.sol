// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

import "@account-abstraction/contracts/interfaces/IPaymaster.sol";
import "@account-abstraction/contracts/interfaces/IEntryPoint.sol";

/**
 * @title NotesPaymaster
 * @dev Simple paymaster that sponsors gas for all operations
 */
contract NotesPaymaster is IPaymaster {
    
    IEntryPoint public immutable entryPoint;
    address public paymasterOwner;
    
    event UserOperationSponsored(address indexed user, bytes32 indexed userOpHash);

    modifier onlyPaymasterOwner() {
        require(msg.sender == paymasterOwner, "Not paymaster owner");
        _;
    }

    constructor(IEntryPoint _entryPoint) {
        entryPoint = _entryPoint;
        paymasterOwner = msg.sender;
    }

    /**
     * @dev Validate UserOperation and decide whether to sponsor
     */
    function validatePaymasterUserOp(UserOperation calldata userOp, bytes32 userOpHash, uint256 maxCost)
    external override returns (bytes memory context, uint256 validationData) {
        
        require(msg.sender == address(entryPoint), "Only EntryPoint");
        
        // Simple validation - sponsor all operations
        // Check if we have enough deposit to cover the cost
        require(getDeposit() >= maxCost, "Insufficient paymaster balance");

        emit UserOperationSponsored(userOp.sender, userOpHash);

        return ("", 0);
    }

    /**
     * @dev Post-operation hook
     */
    function postOp(PostOpMode mode, bytes calldata context, uint256 actualGasCost) external override {
        require(msg.sender == address(entryPoint), "Only EntryPoint");
        // Post-operation logic if needed
    }

    /**
     * @dev Owner can fund the paymaster
     */
    function fundPaymaster() external payable onlyPaymasterOwner {
        entryPoint.depositTo{value: msg.value}(address(this));
    }

    /**
     * @dev Owner can withdraw funds
     */
    function withdrawFunds(address payable withdrawAddress, uint256 amount) external onlyPaymasterOwner {
        entryPoint.withdrawTo(withdrawAddress, amount);
    }

    /**
     * @dev Get current paymaster balance
     */
    function getDeposit() public view returns (uint256) {
        return entryPoint.balanceOf(address(this));
    }
}