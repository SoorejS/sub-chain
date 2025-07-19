const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  chainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chain',
  },
  content: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text',
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  metadata: {
    type: Map,
    of: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Middleware to update read status
messageSchema.pre('save', function(next) {
  if (this.isModified('isRead') && this.isRead) {
    this.updatedAt = Date.now();
  }
  next();
});

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
