import mongoose from 'mongoose';
import { Mutex } from 'async-mutex';
import { Auction } from '../models/Auction.js';
import { Bid } from '../models/Bid.js';
import { Wallet } from '../models/Wallet.js';
import { Transaction } from '../models/Transaction.js';
import { config } from '../config/env.js';
import { emitToAuction, emitToUser } from './socketService.js';

// Map of mutexes per auction to serialize requests per auction ID
const auctionMutexMap = new Map();

const getAuctionMutex = (auctionId) => {
  const key = auctionId.toString();
  if (!auctionMutexMap.has(key)) {
    auctionMutexMap.set(key, new Mutex());
  }
  return auctionMutexMap.get(key);
};

export const placeBidAtomic = async ({ auctionId, bidderId, amount }) => {
  const numAmount = Number(amount);
  if (isNaN(numAmount) || numAmount <= 0) {
    const err = new Error('Invalid bid amount');
    err.status = 400;
    throw err;
  }

  const mutex = getAuctionMutex(auctionId);
  const releaseLock = await mutex.acquire();

  let session = null;
  try {
    const supportsTransactions = mongoose.connection.client?.topology?.description?.type === 'ReplicaSetWithPrimary' ||
      mongoose.connection.client?.topology?.s?.replicaSet;

    if (supportsTransactions) {
      try {
        session = await mongoose.startSession();
      } catch (e) {
        session = null;
      }
    }

    const executeLogic = async (sess) => {
      const now = new Date();

      // 1. Fetch auction
      const query = Auction.findById(auctionId);
      if (sess) query.session(sess);
      const auction = await query;

      if (!auction) {
        const err = new Error('Auction not found');
        err.status = 404;
        throw err;
      }

      if (auction.status !== 'LIVE') {
        const err = new Error(`Cannot bid on auction in '${auction.status}' state`);
        err.status = 400;
        throw err;
      }

      if (now > auction.endTime) {
        const err = new Error('Auction has already ended');
        err.status = 400;
        throw err;
      }

      if (now < auction.startTime) {
        const err = new Error('Auction has not started yet');
        err.status = 400;
        throw err;
      }

      if (auction.sellerId.toString() === bidderId.toString()) {
        const err = new Error('Sellers cannot bid on their own auctions');
        err.status = 403;
        throw err;
      }

      // 2. Determine minimum required bid
      const isFirstBid = auction.totalBids === 0;
      const minRequiredBid = isFirstBid
        ? auction.startingPrice
        : auction.currentHighestBid + auction.minIncrement;

      if (numAmount < minRequiredBid) {
        const err = new Error(`Bid amount must be at least $${minRequiredBid.toFixed(2)} (Current: $${auction.currentHighestBid}, Min Increment: $${auction.minIncrement})`);
        err.status = 400;
        throw err;
      }

      // 3. Find or create bidder's wallet
      const walletQuery = Wallet.findOne({ userId: bidderId });
      if (sess) walletQuery.session(sess);
      let bidderWallet = await walletQuery;

      if (!bidderWallet) {
        bidderWallet = new Wallet({ userId: bidderId, availableBalance: 1000, heldBalance: 0 });
        if (sess) await bidderWallet.save({ session: sess });
        else await bidderWallet.save();
      }

      const previousHighestBidderId = auction.highestBidderId;
      const previousHighestBid = auction.currentHighestBid;
      const isSameBidderRaising = previousHighestBidderId && previousHighestBidderId.toString() === bidderId.toString();

      // 4. Calculate wallet hold changes
      let holdDeltaForBidder = numAmount;
      if (isSameBidderRaising) {
        holdDeltaForBidder = numAmount - previousHighestBid;
      }

      if (bidderWallet.availableBalance < holdDeltaForBidder) {
        const err = new Error(`Insufficient wallet balance. You need $${holdDeltaForBidder.toFixed(2)} available, but only have $${bidderWallet.availableBalance.toFixed(2)}`);
        err.status = 400;
        throw err;
      }

      // 5. Update bidder's wallet (hold amount)
      bidderWallet.availableBalance -= holdDeltaForBidder;
      bidderWallet.heldBalance += holdDeltaForBidder;
      if (sess) await bidderWallet.save({ session: sess });
      else await bidderWallet.save();

      // Create transaction record for hold
      const txPayload = [{
        walletId: bidderWallet._id,
        userId: bidderId,
        type: 'HOLD',
        amount: holdDeltaForBidder,
        auctionId: auction._id,
        description: `Held $${holdDeltaForBidder.toFixed(2)} for bid on '${auction.title}'`,
        balanceAfter: bidderWallet.availableBalance,
        heldAfter: bidderWallet.heldBalance
      }];
      if (sess) await Transaction.create(txPayload, { session: sess });
      else await Transaction.create(txPayload);

      // 6. Release previous bidder's hold if it was a different user
      let previousBidderWallet = null;
      if (previousHighestBidderId && !isSameBidderRaising && previousHighestBid > 0) {
        const prevWQuery = Wallet.findOne({ userId: previousHighestBidderId });
        if (sess) prevWQuery.session(sess);
        previousBidderWallet = await prevWQuery;

        if (previousBidderWallet) {
          const releaseAmount = Math.min(previousBidderWallet.heldBalance, previousHighestBid);
          previousBidderWallet.heldBalance -= releaseAmount;
          previousBidderWallet.availableBalance += releaseAmount;
          if (sess) await previousBidderWallet.save({ session: sess });
          else await previousBidderWallet.save();

          const relTx = [{
            walletId: previousBidderWallet._id,
            userId: previousHighestBidderId,
            type: 'RELEASE',
            amount: releaseAmount,
            auctionId: auction._id,
            description: `Released $${releaseAmount.toFixed(2)} after being outbid on '${auction.title}'`,
            balanceAfter: previousBidderWallet.availableBalance,
            heldAfter: previousBidderWallet.heldBalance
          }];
          if (sess) await Transaction.create(relTx, { session: sess });
          else await Transaction.create(relTx);
        }
      }

      // Mark ALL previous active bids for this auction as OUTBID unconditionally
      if (sess) {
        await Bid.updateMany(
          { auctionId: auction._id, status: 'ACTIVE' },
          { $set: { status: 'OUTBID' } },
          { session: sess }
        );
      } else {
        await Bid.updateMany(
          { auctionId: auction._id, status: 'ACTIVE' },
          { $set: { status: 'OUTBID' } }
        );
      }

      // 7. Create new Bid record
      const bidPayload = [{
        auctionId: auction._id,
        bidderId: bidderId,
        amount: numAmount,
        status: 'ACTIVE'
      }];
      const [newBid] = sess
        ? await Bid.create(bidPayload, { session: sess })
        : await Bid.create(bidPayload);

      // 8. Anti-sniping calculation
      const msRemaining = auction.endTime.getTime() - now.getTime();
      const thresholdMs = config.antiSnipingThresholdSeconds * 1000;
      let antiSnipingExtended = false;

      if (msRemaining <= thresholdMs) {
        const extensionMs = config.antiSnipingExtensionSeconds * 1000;
        auction.endTime = new Date(auction.endTime.getTime() + extensionMs);
        auction.antiSnipingCount += 1;
        antiSnipingExtended = true;
      }

      // 9. Update Auction state
      auction.currentHighestBid = numAmount;
      auction.highestBidderId = bidderId;
      auction.totalBids += 1;
      auction.version += 1;
      if (sess) await auction.save({ session: sess });
      else await auction.save();

      return {
        auction,
        newBid,
        bidderWallet,
        previousHighestBidderId: isSameBidderRaising ? null : previousHighestBidderId,
        previousHighestBid,
        previousBidderWallet,
        antiSnipingExtended
      };
    };

    let result = null;
    if (session) {
      await session.withTransaction(async () => {
        result = await executeLogic(session);
      });
    } else {
      result = await executeLogic(null);
    }

    // Post-transaction notifications & real-time broadcasts
    if (result) {
      const populatedBid = await Bid.findById(result.newBid._id).populate('bidderId', 'name email avatar');

      // 1. Broadcast to all clients in auction room
      emitToAuction(result.auction._id, 'auction:bid_placed', {
        auctionId: result.auction._id,
        currentHighestBid: result.auction.currentHighestBid,
        highestBidderId: result.auction.highestBidderId,
        highestBidderName: populatedBid.bidderId?.name || 'Anonymous',
        totalBids: result.auction.totalBids,
        endTime: result.auction.endTime,
        antiSnipingExtended: result.antiSnipingExtended,
        bid: populatedBid
      });

      // 2. Notify new bidder of updated wallet
      emitToUser(bidderId, 'wallet:updated', {
        availableBalance: result.bidderWallet.availableBalance,
        heldBalance: result.bidderWallet.heldBalance,
        totalBalance: result.bidderWallet.availableBalance + result.bidderWallet.heldBalance
      });

      // 3. Notify previous outbid user
      if (result.previousHighestBidderId) {
        emitToUser(result.previousHighestBidderId, 'auction:outbid', {
          auctionId: result.auction._id,
          auctionTitle: result.auction.title,
          newHighestBid: result.auction.currentHighestBid,
          previousBid: result.previousHighestBid,
          message: `You were outbid on '${result.auction.title}'! New highest bid is $${result.auction.currentHighestBid.toFixed(2)}.`
        });

        if (result.previousBidderWallet) {
          emitToUser(result.previousHighestBidderId, 'wallet:updated', {
            availableBalance: result.previousBidderWallet.availableBalance,
            heldBalance: result.previousBidderWallet.heldBalance,
            totalBalance: result.previousBidderWallet.availableBalance + result.previousBidderWallet.heldBalance
          });
        }
      }
    }

    return result;
  } finally {
    if (session) {
      await session.endSession();
    }
    releaseLock();
  }
};
