import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Auction',
    required: true,
    index: true,
  },
  bidderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: [true, 'Bid amount is required'],
    min: [1, 'Bid amount must be greater than zero'],
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'OUTBID', 'WON', 'CANCELLED'],
    default: 'ACTIVE',
    index: true,
  },
}, {
  timestamps: true,
});

bidSchema.index({ auctionId: 1, amount: -1, createdAt: -1 });

export const Bid = mongoose.model('Bid', bidSchema);
