import mongoose from 'mongoose';
import { Auction } from '../models/Auction.js';
import { Bid } from '../models/Bid.js';
import { Wallet } from '../models/Wallet.js';
import { Transaction } from '../models/Transaction.js';
import { emitToAuction, emitToUser, emitGlobal } from './socketService.js';

export const settleAuctionAtomic = async (auctionId) => {
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

    const executeSettle = async (sess) => {
      const q = Auction.findById(auctionId);
      if (sess) q.session(sess);
      const auction = await q;

      if (!auction) return null;
      if (auction.status !== 'LIVE' && auction.status !== 'CLOSED') return null;

      const now = new Date();
      if (auction.endTime > now && auction.status === 'LIVE') return null;

      const hasBids = auction.totalBids > 0 && auction.highestBidderId;
      const reserveMet = !auction.reservePrice || auction.currentHighestBid >= auction.reservePrice;

      if (hasBids && reserveMet) {
        const winningAmount = auction.currentHighestBid;
        const winnerId = auction.highestBidderId;
        const sellerId = auction.sellerId;

        // 1. Debit winner's held balance
        const wq = Wallet.findOne({ userId: winnerId });
        if (sess) wq.session(sess);
        const winnerWallet = await wq;

        if (winnerWallet) {
          const debitAmount = Math.min(winnerWallet.heldBalance, winningAmount);
          winnerWallet.heldBalance -= debitAmount;
          if (sess) await winnerWallet.save({ session: sess });
          else await winnerWallet.save();

          const txP = [{
            walletId: winnerWallet._id,
            userId: winnerId,
            type: 'DEBIT_WIN',
            amount: debitAmount,
            auctionId: auction._id,
            description: `Won auction '${auction.title}' for $${debitAmount.toFixed(2)}`,
            balanceAfter: winnerWallet.availableBalance,
            heldAfter: winnerWallet.heldBalance
          }];
          if (sess) await Transaction.create(txP, { session: sess });
          else await Transaction.create(txP);
        }

        // 2. Credit seller's available balance
        const sq = Wallet.findOne({ userId: sellerId });
        if (sess) sq.session(sess);
        let sellerWallet = await sq;

        if (!sellerWallet) {
          sellerWallet = new Wallet({ userId: sellerId, availableBalance: 0, heldBalance: 0 });
        }
        sellerWallet.availableBalance += winningAmount;
        if (sess) await sellerWallet.save({ session: sess });
        else await sellerWallet.save();

        const stxP = [{
          walletId: sellerWallet._id,
          userId: sellerId,
          type: 'CREDIT_SELLER',
          amount: winningAmount,
          auctionId: auction._id,
          description: `Payout for winning bid on '${auction.title}'`,
          balanceAfter: sellerWallet.availableBalance,
          heldAfter: sellerWallet.heldBalance
        }];
        if (sess) await Transaction.create(stxP, { session: sess });
        else await Transaction.create(stxP);

        // 3. Mark winning bid
        if (sess) {
          await Bid.updateOne(
            { auctionId: auction._id, bidderId: winnerId, amount: winningAmount },
            { $set: { status: 'WON' } },
            { session: sess }
          );
        } else {
          await Bid.updateOne(
            { auctionId: auction._id, bidderId: winnerId, amount: winningAmount },
            { $set: { status: 'WON' } }
          );
        }

        // 4. Update Auction status
        auction.status = 'SETTLED';
        auction.winnerId = winnerId;
        auction.winningBid = winningAmount;
        if (sess) await auction.save({ session: sess });
        else await auction.save();

        return {
          auction,
          winnerId,
          sellerId,
          winningAmount,
          type: 'SETTLED_WITH_WINNER',
          winnerWallet,
          sellerWallet
        };
      } else {
        if (hasBids && !reserveMet) {
          const bq = Wallet.findOne({ userId: auction.highestBidderId });
          if (sess) bq.session(sess);
          const bidderWallet = await bq;

          if (bidderWallet) {
            const releaseAmount = Math.min(bidderWallet.heldBalance, auction.currentHighestBid);
            bidderWallet.heldBalance -= releaseAmount;
            bidderWallet.availableBalance += releaseAmount;
            if (sess) await bidderWallet.save({ session: sess });
            else await bidderWallet.save();

            const rtx = [{
              walletId: bidderWallet._id,
              userId: auction.highestBidderId,
              type: 'RELEASE',
              amount: releaseAmount,
              auctionId: auction._id,
              description: `Released $${releaseAmount.toFixed(2)} - Reserve price of $${auction.reservePrice} was not met on '${auction.title}'`,
              balanceAfter: bidderWallet.availableBalance,
              heldAfter: bidderWallet.heldBalance
            }];
            if (sess) await Transaction.create(rtx, { session: sess });
            else await Transaction.create(rtx);
          }
        }

        auction.status = 'CLOSED';
        auction.winnerId = null;
        auction.winningBid = 0;
        if (sess) await auction.save({ session: sess });
        else await auction.save();

        return {
          auction,
          type: 'CLOSED_NO_WINNER',
          reason: hasBids ? 'Reserve price not met' : 'No bids placed'
        };
      }
    };

    let settlementResult = null;
    if (session) {
      await session.withTransaction(async () => {
        settlementResult = await executeSettle(session);
      });
    } else {
      settlementResult = await executeSettle(null);
    }

    if (settlementResult) {
      // Real-time broadcasts
      emitToAuction(settlementResult.auction._id, 'auction:status_changed', {
        auctionId: settlementResult.auction._id,
        status: settlementResult.auction.status,
        winnerId: settlementResult.auction.winnerId,
        winningBid: settlementResult.auction.winningBid,
        type: settlementResult.type,
        reason: settlementResult.reason
      });

      emitGlobal('auction:status_changed', {
        auctionId: settlementResult.auction._id,
        status: settlementResult.auction.status,
        winnerId: settlementResult.auction.winnerId,
        winningBid: settlementResult.auction.winningBid
      });

      if (settlementResult.type === 'SETTLED_WITH_WINNER') {
        emitToUser(settlementResult.winnerId, 'auction:won', {
          auctionId: settlementResult.auction._id,
          auctionTitle: settlementResult.auction.title,
          amount: settlementResult.winningAmount
        });

        if (settlementResult.winnerWallet) {
          emitToUser(settlementResult.winnerId, 'wallet:updated', {
            availableBalance: settlementResult.winnerWallet.availableBalance,
            heldBalance: settlementResult.winnerWallet.heldBalance,
            totalBalance: settlementResult.winnerWallet.availableBalance + settlementResult.winnerWallet.heldBalance
          });
        }

        if (settlementResult.sellerWallet) {
          emitToUser(settlementResult.sellerId, 'wallet:updated', {
            availableBalance: settlementResult.sellerWallet.availableBalance,
            heldBalance: settlementResult.sellerWallet.heldBalance,
            totalBalance: settlementResult.sellerWallet.availableBalance + settlementResult.sellerWallet.heldBalance
          });
        }
      }
    }
  } catch (err) {
    console.error(`[Settlement Error] Auction ${auctionId}:`, err.message);
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

export const cancelAuctionAtomic = async (auctionId, reason = 'Cancelled by Admin') => {
  let session = null;
  try {
    session = await mongoose.startSession();
    let cancelResult = null;

    await session.withTransaction(async () => {
      const auction = await Auction.findById(auctionId).session(session);
      if (!auction) throw { status: 404, message: 'Auction not found' };
      if (auction.status === 'SETTLED' || auction.status === 'CANCELLED') {
        throw { status: 400, message: `Auction cannot be cancelled in '${auction.status}' state` };
      }

      // If active highest bidder, release hold
      if (auction.highestBidderId && auction.currentHighestBid > 0) {
        const bidderWallet = await Wallet.findOne({ userId: auction.highestBidderId }).session(session);
        if (bidderWallet) {
          const releaseAmount = Math.min(bidderWallet.heldBalance, auction.currentHighestBid);
          bidderWallet.heldBalance -= releaseAmount;
          bidderWallet.availableBalance += releaseAmount;
          await bidderWallet.save({ session });

          await Transaction.create([{
            walletId: bidderWallet._id,
            userId: auction.highestBidderId,
            type: 'REFUND',
            amount: releaseAmount,
            auctionId: auction._id,
            description: `Refunded $${releaseAmount.toFixed(2)} - Auction '${auction.title}' was cancelled (${reason})`,
            balanceAfter: bidderWallet.availableBalance,
            heldAfter: bidderWallet.heldBalance
          }], { session });
        }

        await Bid.updateMany(
          { auctionId: auction._id, status: 'ACTIVE' },
          { $set: { status: 'CANCELLED' } },
          { session }
        );
      }

      auction.status = 'CANCELLED';
      await auction.save({ session });

      cancelResult = { auction, reason };
    });

    if (cancelResult) {
      emitToAuction(auctionId, 'auction:status_changed', {
        auctionId,
        status: 'CANCELLED',
        reason
      });
      emitGlobal('auction:status_changed', {
        auctionId,
        status: 'CANCELLED',
        reason
      });
    }

    return cancelResult;
  } finally {
    if (session) {
      await session.endSession();
    }
  }
};

// Scheduler background runner to transition SCHEDULED -> LIVE and LIVE -> CLOSED/SETTLED
export const startAuctionScheduler = (intervalMs = 2000) => {
  console.log('[Scheduler] Auction lifecycle background engine started');

  const intervalId = setInterval(async () => {
    try {
      const now = new Date();

      // 1. Transition SCHEDULED -> LIVE
      const toLive = await Auction.find({
        status: 'SCHEDULED',
        startTime: { $lte: now }
      });

      for (const auc of toLive) {
        auc.status = 'LIVE';
        await auc.save();
        console.log(`[Scheduler] Auction '${auc.title}' is now LIVE!`);
        emitToAuction(auc._id, 'auction:status_changed', { auctionId: auc._id, status: 'LIVE' });
        emitGlobal('auction:status_changed', { auctionId: auc._id, status: 'LIVE' });
      }

      // 2. Transition LIVE -> CLOSED / SETTLED
      const toClose = await Auction.find({
        status: 'LIVE',
        endTime: { $lte: now }
      });

      for (const auc of toClose) {
        console.log(`[Scheduler] Auction '${auc.title}' ended, settling...`);
        await settleAuctionAtomic(auc._id);
      }
    } catch (err) {
      console.error('[Scheduler Error]:', err.message);
    }
  }, intervalMs);

  return intervalId;
};
