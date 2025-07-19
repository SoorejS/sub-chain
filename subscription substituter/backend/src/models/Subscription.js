const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    enum: ['USD', 'EUR', 'GBP', 'INR'],
    default: 'USD',
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly'],
    default: 'monthly',
  },
  startDate: {
    type: Date,
    required: true,
  },
  nextRenewalDate: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'cancelled'],
    default: 'active',
  },
  category: {
    type: String,
    enum: ['entertainment', 'education', 'productivity', 'health', 'other'],
    default: 'other',
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  chainId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chain',
  },
  isShared: {
    type: Boolean,
    default: false,
  },
  sharedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'other'],
  },
  paymentId: {
    type: String,
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

subscriptionSchema.pre('save', function(next) {
  if (this.isModified('startDate')) {
    const frequency = this.frequency;
    const startDate = new Date(this.startDate);
    
    switch (frequency) {
      case 'daily':
        startDate.setDate(startDate.getDate() + 1);
        break;
      case 'weekly':
        startDate.setDate(startDate.getDate() + 7);
        break;
      case 'monthly':
        startDate.setMonth(startDate.getMonth() + 1);
        break;
      case 'yearly':
        startDate.setFullYear(startDate.getFullYear() + 1);
        break;
    }
    this.nextRenewalDate = startDate;
  }
  next();
});

const Subscription = mongoose.model('Subscription', subscriptionSchema);
module.exports = Subscription;
