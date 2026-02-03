// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title NotesRegistry
 * @dev On-chain registry for note integrity verification
 * Stores minimal data: noteHash, owner, timestamp
 */
contract NotesRegistry is Ownable, ReentrancyGuard {
    
    struct NoteRecord {
        bytes32 noteHash;
        address owner;
        uint256 timestamp;
        bool exists;
    }

    // noteId => NoteRecord
    mapping(bytes32 => NoteRecord) public notes;
    
    // owner => noteId[]
    mapping(address => bytes32[]) public userNotes;
    
    // Events
    event NoteRegistered(
        bytes32 indexed noteId,
        bytes32 indexed noteHash,
        address indexed owner,
        uint256 timestamp
    );
    
    event NoteUpdated(
        bytes32 indexed noteId,
        bytes32 indexed newNoteHash,
        uint256 timestamp
    );

    constructor(address initialOwner) Ownable(initialOwner) {}

    /**
     * @dev Register a new note on-chain
     * @param noteId Unique identifier for the note
     * @param noteHash Hash of the note content
     */
    function registerNote(bytes32 noteId, bytes32 noteHash) external nonReentrant {
        require(noteId != bytes32(0), "Invalid note ID");
        require(noteHash != bytes32(0), "Invalid note hash");
        require(!notes[noteId].exists, "Note already exists");

        notes[noteId] = NoteRecord({
            noteHash: noteHash,
            owner: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        userNotes[msg.sender].push(noteId);

        emit NoteRegistered(noteId, noteHash, msg.sender, block.timestamp);
    }

    /**
     * @dev Update an existing note (only by owner)
     * @param noteId The note to update
     * @param newNoteHash New hash of the note content
     */
    function updateNote(bytes32 noteId, bytes32 newNoteHash) external nonReentrant {
        require(notes[noteId].exists, "Note does not exist");
        require(notes[noteId].owner == msg.sender, "Not note owner");
        require(newNoteHash != bytes32(0), "Invalid note hash");

        notes[noteId].noteHash = newNoteHash;
        notes[noteId].timestamp = block.timestamp;

        emit NoteUpdated(noteId, newNoteHash, block.timestamp);
    }

    /**
     * @dev Get note details
     */
    function getNote(bytes32 noteId) external view returns (
        bytes32 noteHash,
        address owner,
        uint256 timestamp,
        bool exists
    ) {
        NoteRecord memory note = notes[noteId];
        return (note.noteHash, note.owner, note.timestamp, note.exists);
    }

    /**
     * @dev Get all note IDs for a user
     */
    function getUserNotes(address user) external view returns (bytes32[] memory) {
        return userNotes[user];
    }

    /**
     * @dev Get user's note count
     */
    function getUserNoteCount(address user) external view returns (uint256) {
        return userNotes[user].length;
    }

    /**
     * @dev Verify note integrity
     */
    function verifyNote(bytes32 noteId, bytes32 expectedHash) external view returns (bool) {
        return notes[noteId].exists && notes[noteId].noteHash == expectedHash;
    }
}