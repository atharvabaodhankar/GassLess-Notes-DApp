const mongoose = require('mongoose');
const crypto = require('crypto');

const noteSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    maxlength: 200
  },
  content: {
    type: String,
    required: true,
    maxlength: 10000
  },
  contentHash: {
    type: String,
    required: true
  },
  onChainStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'failed'],
    default: 'pending'
  },
  transactionHash: {
    type: String,
    default: null
  },
  blockNumber: {
    type: Number,
    default: null
  },
  userOpHash: {
    type: String,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  onChainTimestamp: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Indexes for performance
noteSchema.index({ userId: 1, createdAt: -1 });
noteSchema.index({ id: 1 });
noteSchema.index({ onChainStatus: 1 });
noteSchema.index({ userOpHash: 1 });

// Pre-save middleware to generate content hash
noteSchema.pre('save', function(next) {
  if (this.isModified('content') || this.isModified('title')) {
    const contentToHash = `${this.title}|${this.content}`;
    this.contentHash = crypto.createHash('sha256').update(contentToHash).digest('hex');
  }
  next();
});

// Method to generate note ID
noteSchema.statics.generateNoteId = function(userId) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  return `note_${userId}_${timestamp}_${random}`;
};

// Method to get blockchain note ID (bytes32)
noteSchema.methods.getBlockchainNoteId = function() {
  return '0x' + crypto.createHash('sha256').update(this.id).digest('hex');
};

// Method to get content hash as bytes32
noteSchema.methods.getContentHashBytes32 = function() {
  return '0x' + this.contentHash;
};

module.exports = mongoose.model('Note', noteSchema);