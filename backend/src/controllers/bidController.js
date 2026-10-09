import { Bid } from '../models/Bid.js';
import { placeBidAtomic } from '../services/biddingService.js';

export const getAuctionBids = async (req, res) => {
  try {
    const bids = await Bid.find({ auctionId: req.params.id })
      .populate('bidderId', 'name email avatar')
      .sort({ createdAt: -1 })
      .limit(50);

    return res.status(200).json({
      success: true,
      count: bids.length,
      data: bids
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const placeBid = async (req, res) => {
  try {
    const { amount } = req.body;
    const auctionId = req.params.id;
    const bidderId = req.user._id;

    const result = await placeBidAtomic({
      auctionId,
      bidderId,
      amount: Number(amount)
    });

    return res.status(201).json({
      success: true,
      message: `Bid of $${Number(amount).toFixed(2)} placed successfully!`,
      data: {
        bid: result.newBid,
        currentHighestBid: result.auction.currentHighestBid,
        endTime: result.auction.endTime,
        antiSnipingExtended: result.antiSnipingExtended,
        wallet: {
          availableBalance: result.bidderWallet.availableBalance,
          heldBalance: result.bidderWallet.heldBalance
        }
      }
    });
  } catch (error) {
    const statusCode = error.status || 500;
    return res.status(statusCode).json({
      success: false,
      message: error.message || 'Error processing bid'
    });
  }
};

export const getMyBids = async (req, res) => {
  try {
    const bids = await Bid.find({ bidderId: req.user._id })
      .populate({
        path: 'auctionId',
        select: 'title category currentHighestBid highestBidderId startingPrice endTime status images winnerId winningBid'
      })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bids.length,
      data: bids
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
