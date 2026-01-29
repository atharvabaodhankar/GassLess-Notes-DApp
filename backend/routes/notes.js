const express = require('express');
const { verifyFirebaseToken } = require('../middleware/auth');
const Note = require('../models/Note');
const User = require('../models/User');
const blockchainService = require('../services/blockchain');

const router = express.Router();

/**
 * POST /api/notes
 * Create a new note
 */
router.post('/', verifyFirebaseToken, async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.uid;

    // Validation
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    if (title.length > 200) {
      return res.status(400).json({ error: 'Title too long (max 200 characters)' });
    }

    if (content.length > 10000) {
      return res.status(400).json({ error: 'Content too long (max 10000 characters)' });
    }

    // Get user info
    const user = await User.findOne({ firebaseUid: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create note
    const noteId = Note.generateNoteId(userId);
    const note = new Note({
      id: noteId,
      userId: userId,
      title: title,
      content: content,
      onChainStatus: 'pending'
    });

    // Save to database first (instant response to user)
    await note.save();

    // Respond immediately to user
    res.status(201).json({
      success: true,
      note: {
        id: note.id,
        title: note.title,
        content: note.content,
        contentHash: note.contentHash,
        onChainStatus: note.onChainStatus,
        createdAt: note.createdAt
      }
    });

    // Process blockchain registration asynchronously
    processBlockchainRegistration(note, user.walletAddress);

  } catch (error) {
    console.error('Create note error:', error);
    res.status(500).json({
      error: 'Failed to create note',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/notes
 * Get user's notes with pagination
 */
router.get('/', verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get notes with pagination
    const notes = await Note.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-__v');

    // Get total count for pagination
    const total = await Note.countDocuments({ userId });

    res.json({
      success: true,
      notes: notes.map(note => ({
        id: note.id,
        title: note.title,
        content: note.content,
        contentHash: note.contentHash,
        onChainStatus: note.onChainStatus,
        transactionHash: note.transactionHash,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        onChainTimestamp: note.onChainTimestamp
      })),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get notes error:', error);
    res.status(500).json({
      error: 'Failed to fetch notes',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * GET /api/notes/:id
 * Get a specific note
 */
router.get('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.uid;

    const note = await Note.findOne({ id: noteId, userId });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({
      success: true,
      note: {
        id: note.id,
        title: note.title,
        content: note.content,
        contentHash: note.contentHash,
        onChainStatus: note.onChainStatus,
        transactionHash: note.transactionHash,
        blockNumber: note.blockNumber,
        userOpHash: note.userOpHash,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt,
        onChainTimestamp: note.onChainTimestamp
      }
    });

  } catch (error) {
    console.error('Get note error:', error);
    res.status(500).json({
      error: 'Failed to fetch note',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * PUT /api/notes/:id
 * Update a note
 */
router.put('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.uid;
    const { title, content } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const note = await Note.findOne({ id: noteId, userId });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    // Update note
    note.title = title;
    note.content = content;
    note.onChainStatus = 'pending'; // Reset status for re-verification
    note.updatedAt = new Date();

    await note.save();

    // Get user for wallet address
    const user = await User.findOne({ firebaseUid: userId });

    res.json({
      success: true,
      note: {
        id: note.id,
        title: note.title,
        content: note.content,
        contentHash: note.contentHash,
        onChainStatus: note.onChainStatus,
        createdAt: note.createdAt,
        updatedAt: note.updatedAt
      }
    });

    // Process blockchain update asynchronously
    processBlockchainUpdate(note, user.walletAddress);

  } catch (error) {
    console.error('Update note error:', error);
    res.status(500).json({
      error: 'Failed to update note',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * DELETE /api/notes/:id
 * Delete a note
 */
router.delete('/:id', verifyFirebaseToken, async (req, res) => {
  try {
    const noteId = req.params.id;
    const userId = req.user.uid;

    const note = await Note.findOneAndDelete({ id: noteId, userId });

    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({
      success: true,
      message: 'Note deleted successfully'
    });

  } catch (error) {
    console.error('Delete note error:', error);
    res.status(500).json({
      error: 'Failed to delete note',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

/**
 * Async function to handle blockchain registration
 */
async function processBlockchainRegistration(note, walletAddress) {
  try {
    console.log(`🔗 Processing blockchain registration for note: ${note.id}`);

    // Build UserOperation
    const noteIdBytes32 = note.getBlockchainNoteId();
    const contentHashBytes32 = note.getContentHashBytes32();
    
    const userOp = await blockchainService.buildRegisterNoteUserOp(
      walletAddress,
      noteIdBytes32,
      contentHashBytes32
    );

    // Sign UserOperation
    const signedUserOp = await blockchainService.signUserOperation(userOp, note.userId);

    // Submit to bundler
    const result = await blockchainService.submitUserOperation(signedUserOp);

    // Update note with blockchain info
    await Note.findOneAndUpdate(
      { id: note.id },
      {
        onChainStatus: result.status,
        userOpHash: result.userOpHash,
        transactionHash: result.transactionHash,
        blockNumber: result.blockNumber,
        onChainTimestamp: result.status === 'confirmed' ? new Date() : null
      }
    );

    console.log(`✅ Blockchain registration completed for note: ${note.id}`);

  } catch (error) {
    console.error(`❌ Blockchain registration failed for note: ${note.id}`, error);
    
    // Update note status to failed
    await Note.findOneAndUpdate(
      { id: note.id },
      { onChainStatus: 'failed' }
    );
  }
}

/**
 * Async function to handle blockchain update
 */
async function processBlockchainUpdate(note, walletAddress) {
  try {
    console.log(`🔗 Processing blockchain update for note: ${note.id}`);
    
    // For updates, we use the same registration process
    // In a more sophisticated system, you might have a separate update function
    await processBlockchainRegistration(note, walletAddress);
    
  } catch (error) {
    console.error(`❌ Blockchain update failed for note: ${note.id}`, error);
  }
}

module.exports = router;