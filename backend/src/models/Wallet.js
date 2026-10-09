import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  availableBalance: {
    type: Number,
    required: true,
    default: 1000.00, // starting demo balance for bidders
    min: [0, 'Available balance cannot be negative'],
  },
  heldBalance: {
    type: Number,
    required: true,
    default: 0.00,
    min: [0, 'Held balance cannot be negative'],
  },
  currency: {
    type: String,
    default: 'USD',
  },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

// Virtual total balance
walletSchema.virtual('totalBalance').get(function () {
  return (this.availableBalance || 0) + (this.heldBalance || 0);
});

export const Wallet = mongoose.model('Wallet', walletSchema);
