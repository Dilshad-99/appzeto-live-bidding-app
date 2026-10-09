import mongoose from 'mongoose';

const auctionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Auction title is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    default: 'Collectibles',
    index: true,
  },
  images: {
    type: [String],
    default: [],
  },
  sellerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  startingPrice: {
    type: Number,
    required: [true, 'Starting price is required'],
    min: [1, 'Starting price must be at least 1'],
  },
  currentHighestBid: {
    type: Number,
    default: 0,
  },
  highestBidderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  minIncrement: {
    type: Number,
    default: 10,
    min: [1, 'Minimum increment must be at least 1'],
  },
  reservePrice: {
    type: Number,
    default: 0,
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required'],
    index: true,
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
    index: true,
  },
  status: {
    type: String,
    enum: ['DRAFT', 'SCHEDULED', 'LIVE', 'CLOSED', 'SETTLED', 'CANCELLED'],
    default: 'DRAFT',
    index: true,
  },
  winnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  winningBid: {
    type: Number,
    default: 0,
  },
  totalBids: {
    type: Number,
    default: 0,
  },
  antiSnipingCount: {
    type: Number,
    default: 0,
  },
  version: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true,
});

// Index for active live auctions querying
auctionSchema.index({ status: 1, endTime: 1 });
auctionSchema.index({ status: 1, startTime: 1 });

export const Auction = mongoose.model('Auction', auctionSchema);
