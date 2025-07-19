const mongoose = require('mongoose');

const chainSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected'],
      default: 'pending',
    },
    sharePercentage: {
      type: Number,
      min: 0,
      max: 100,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  }],
  subscriptions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
  }],
  rules: {
    paymentDueDate: {
      type: Date,
    },
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'debit_card', 'paypal', 'other'],
    },
    paymentSplitMethod: {
      type: String,
      enum: ['equal', 'custom'],
      default: 'equal',
    },
    autoRenew: {
      type: Boolean,
      default: true,
    },
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'expired'],
    default: 'active',
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

// Middleware to update member counts
chainSchema.pre('save', function(next) {
  if (this.isModified('members')) {
    const totalPercentage = this.members.reduce((sum, member) => {
      return sum + (member.sharePercentage || 0);
    }, 0);
    
    if (totalPercentage > 100) {
      throw new Error('Total share percentage cannot exceed 100%');
    }
  }
  next();
});

const Chain = mongoose.model('Chain', chainSchema);
module.exports = Chain;
