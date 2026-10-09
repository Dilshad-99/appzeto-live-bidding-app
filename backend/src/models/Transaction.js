import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Wallet',
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: ['TOPUP', 'HOLD', 'RELEASE', 'DEBIT_WIN', 'CREDIT_SELLER', 'REFUND'],
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    index: true,
    default: null,
  },
  description: {
    type: String,
    default: '',
  },
  balanceAfter: {
    type: Number,
    required: true,
  },
  heldAfter: {
    type: Number,
    required: true,
  }
}, {
  timestamps: true,
});

export const Transaction = mongoose.model('Transaction', transactionSchema);
