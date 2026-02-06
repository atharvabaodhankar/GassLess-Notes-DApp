// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

import "@account-abstraction/contracts/samples/SimpleAccountFactory.sol";

/**
 * @title StandardSimpleAccountFactory
 * @dev Uses the official SimpleAccountFactory implementation from account-abstraction package
 * This ensures full compatibility with the canonical EntryPoint v0.6.0
 */
contract StandardSimpleAccountFactory is SimpleAccountFactory {
    constructor(IEntryPoint _entryPoint) SimpleAccountFactory(_entryPoint) {}
}