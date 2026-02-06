// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.24;

import "@account-abstraction/contracts/samples/SimpleAccount.sol";

/**
 * @title StandardSimpleAccount
 * @dev Uses the official SimpleAccount implementation from account-abstraction package
 * This ensures full compatibility with the canonical EntryPoint v0.6.0
 */
contract StandardSimpleAccount is SimpleAccount {
    constructor(IEntryPoint anEntryPoint) SimpleAccount(anEntryPoint) {}
}