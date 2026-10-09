import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Auction } from '../src/models/Auction.js';
import { Wallet } from '../src/models/Wallet.js';
import { placeBidAtomic } from '../src/services/biddingService.js';
import { settleAuctionAtomic, cancelAuctionAtomic } from '../src/services/auctionScheduler.js';

describe('Task 1: Auction Lifecycle, Anti-Sniping & Settlement Tests', () => {
  let seller, bidderA, bidderB;

  before(async () => {
    await connectDB();

    seller = await User.create({
      name: 'Auctioneer Sam',
      email: `sam_seller_${Date.now()}@test.com`,
      password: 'password123',
      role: 'SELLER'
    });
    await Wallet.create({ userId: seller._id, availableBalance: 0, heldBalance: 0 });

    bidderA = await User.create({
      name: 'Alice Bidder',
      email: `alice_${Date.now()}@test.com`,
      password: 'password123',
      role: 'BIDDER'
    });
    await Wallet.create({ userId: bidderA._id, availableBalance: 5000, heldBalance: 0 });

    bidderB = await User.create({
      name: 'Bob Bidder',
      email: `bob_${Date.now()}@test.com`,
      password: 'password123',
      role: 'BIDDER'
    });
    await Wallet.create({ userId: bidderB._id, availableBalance: 5000, heldBalance: 0 });
  });

  after(async () => {
    await mongoose.connection.close();
  });

  it('Anti-Sniping: Bid placed within last 2 minutes extends auction end time by 2 minutes', async () => {
    const now = new Date();
    // Auction ends in 60 seconds (< 120s threshold)
    const initialEndTime = new Date(now.getTime() + 60 * 1000);

    const auction = await Auction.create({
      title: 'Anti-Sniping Test Art Piece',
      description: 'Testing anti-sniping dynamic extension',
      category: 'Art & Collectibles',
      sellerId: seller._id,
      startingPrice: 300,
      currentHighestBid: 0,
      minIncrement: 25,
      startTime: new Date(now.getTime() - 10000),
      endTime: initialEndTime,
      status: 'LIVE'
    });

    const res = await placeBidAtomic({
      auctionId: auction._id,
      bidderId: bidderA._id,
      amount: 325
    });

    assert.strictEqual(res.antiSnipingExtended, true, 'Anti-sniping flag must be triggered');

    const updated = await Auction.findById(auction._id);
    assert.strictEqual(updated.antiSnipingCount, 1);
    // End time must be extended by ~120 seconds
    const diffMs = updated.endTime.getTime() - initialEndTime.getTime();
    assert(diffMs >= 119000 && diffMs <= 121000, `End time should be extended by ~120s, got diff ${diffMs}ms`);
  });

  it('Seller Prevention: Seller cannot bid on their own auction', async () => {
    const now = new Date();
    const auction = await Auction.create({
      title: 'Self-Bidding Guard Test',
      description: 'Testing seller bid rejection',
      category: 'Electronics',
      sellerId: seller._id,
      startingPrice: 500,
      minIncrement: 10,
      startTime: new Date(now.getTime() - 10000),
      endTime: new Date(now.getTime() + 600000),
      status: 'LIVE'
    });

    try {
      await placeBidAtomic({
        auctionId: auction._id,
        bidderId: seller._id, // seller trying to bid
        amount: 550
      });
      assert.fail('Should have rejected seller bid');
    } catch (err) {
      assert.strictEqual(err.status, 403);
      assert(err.message.includes('Sellers cannot bid on their own auctions'));
    }
  });

  it('Reserve Price Settlement: If reserve price is not met at close, auction closes with no winner and hold is released', async () => {
    const reserveBidder = await User.create({
      name: 'Reserve Test Bidder',
      email: `reserve_bidder_${Date.now()}@test.com`,
      password: 'password123',
      role: 'BIDDER'
    });
    await Wallet.create({ userId: reserveBidder._id, availableBalance: 5000, heldBalance: 0 });

    const now = new Date();
    const auction = await Auction.create({
      title: 'Reserve Price Test Ferrari 250 GTO Model',
      description: 'Testing reserve price threshold',
      category: 'Collectibles',
      sellerId: seller._id,
      startingPrice: 500,
      currentHighestBid: 0,
      minIncrement: 50,
      reservePrice: 2000, // Reserve is $2000
      startTime: new Date(now.getTime() - 10000),
      endTime: new Date(now.getTime() + 1000), // ends soon
      status: 'LIVE'
    });

    // ReserveBidder bids $1000 (< $2000 reserve)
    await placeBidAtomic({
      auctionId: auction._id,
      bidderId: reserveBidder._id,
      amount: 1000
    });

    // Check hold placed on Bidder
    let bidderWallet = await Wallet.findOne({ userId: reserveBidder._id });
    assert.strictEqual(bidderWallet.heldBalance, 1000);
    assert.strictEqual(bidderWallet.availableBalance, 4000);

    // Fast-forward end time and trigger settlement
    auction.endTime = new Date(now.getTime() - 1000);
    await auction.save();

    await settleAuctionAtomic(auction._id);

    const settledAuction = await Auction.findById(auction._id);
    assert.strictEqual(settledAuction.status, 'CLOSED');
    assert.strictEqual(settledAuction.winnerId, null, 'No winner when reserve is not met');

    // Hold must be completely released back to available balance!
    bidderWallet = await Wallet.findOne({ userId: reserveBidder._id });
    assert.strictEqual(bidderWallet.heldBalance, 0, 'Bidder hold must be 0 after reserve unmet settlement');
    assert.strictEqual(bidderWallet.availableBalance, 5000);
  });

  it('Winner Settlement & Seller Payout: Winner holds captured and seller credited on settlement', async () => {
    const now = new Date();
    const auction = await Auction.create({
      title: 'Successful Settlement Test Diamond Ring',
      description: 'Testing full winner settlement',
      category: 'Jewelry',
      sellerId: seller._id,
      startingPrice: 400,
      currentHighestBid: 0,
      minIncrement: 50,
      reservePrice: 500,
      startTime: new Date(now.getTime() - 10000),
      endTime: new Date(now.getTime() + 1000),
      status: 'LIVE'
    });

    // Bob bids $800 (meets reserve)
    await placeBidAtomic({
      auctionId: auction._id,
      bidderId: bidderB._id,
      amount: 800
    });

    const sellerWalletBefore = await Wallet.findOne({ userId: seller._id });
    const initialSellerBalance = sellerWalletBefore.availableBalance;

    // Trigger settlement
    auction.endTime = new Date(now.getTime() - 1000);
    await auction.save();

    await settleAuctionAtomic(auction._id);

    const settled = await Auction.findById(auction._id);
    assert.strictEqual(settled.status, 'SETTLED');
    assert.strictEqual(settled.winnerId.toString(), bidderB._id.toString());
    assert.strictEqual(settled.winningBid, 800);

    // Winner's held balance is debited (cleared from hold, not refunded to available)
    const bobWallet = await Wallet.findOne({ userId: bidderB._id });
    assert.strictEqual(bobWallet.heldBalance, 0);
    assert.strictEqual(bobWallet.availableBalance, 5000 - 800);

    // Seller's available balance is credited by $800
    const sellerWalletAfter = await Wallet.findOne({ userId: seller._id });
    assert.strictEqual(sellerWalletAfter.availableBalance, initialSellerBalance + 800);
  });
});
