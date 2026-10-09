import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import mongoose from 'mongoose';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Auction } from '../src/models/Auction.js';
import { Wallet } from '../src/models/Wallet.js';
import { Bid } from '../src/models/Bid.js';
import { placeBidAtomic } from '../src/services/biddingService.js';

describe('Task 1: Concurrency & Wallet Consistency Tests', () => {
  let seller, bidders = [], auction;

  before(async () => {
    await connectDB();

    // Create a seller
    seller = await User.create({
      name: 'Test Seller',
      email: `seller_${Date.now()}@test.com`,
      password: 'password123',
      role: 'SELLER'
    });

    // Create 30 distinct bidders with $10,000 wallet each
    for (let i = 0; i < 30; i++) {
      const bidder = await User.create({
        name: `Bidder ${i}`,
        email: `bidder_${i}_${Date.now()}@test.com`,
        password: 'password123',
        role: 'BIDDER'
      });
      await Wallet.create({
        userId: bidder._id,
        availableBalance: 10000,
        heldBalance: 0
      });
      bidders.push(bidder);
    }
  });

  after(async () => {
    await mongoose.connection.close();
  });

  it('Concurrent Identical Bids: 20 simultaneous users place the EXACT SAME bid amount -> EXACTLY ONE succeeds', async () => {
    const now = new Date();
    // Create live auction
    auction = await Auction.create({
      title: 'High Concurrency Test Rolex Submariner',
      description: 'Concurrency stress testing item',
      category: 'Watches',
      sellerId: seller._id,
      startingPrice: 1000,
      currentHighestBid: 0,
      minIncrement: 50,
      startTime: new Date(now.getTime() - 10000),
      endTime: new Date(now.getTime() + 600000), // 10 mins remaining
      status: 'LIVE',
      totalBids: 0
    });

    const targetBidAmount = 1050; // Valid first bid
    const testBidders = bidders.slice(0, 20);

    // Fire 20 bids completely simultaneously with Promise.all
    const promises = testBidders.map(bidder =>
      placeBidAtomic({
        auctionId: auction._id,
        bidderId: bidder._id,
        amount: targetBidAmount
      })
        .then(res => ({ success: true, bidderId: bidder._id, res }))
        .catch(err => ({ success: false, bidderId: bidder._id, error: err.message }))
    );

    const results = await Promise.all(promises);

    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    console.log(`[Concurrency Test 1] Sent 20 simultaneous identical bids ($1050):`);
    console.log(`  - Successful bids: ${successful.length}`);
    console.log(`  - Rejected bids:   ${failed.length}`);

    // EXACTLY 1 must succeed
    assert.strictEqual(successful.length, 1, 'Exactly one concurrent bid must succeed for the same bid amount');
    assert.strictEqual(failed.length, 19, 'The remaining 19 bids must be rejected');

    // Check auction state
    const updatedAuction = await Auction.findById(auction._id);
    assert.strictEqual(updatedAuction.currentHighestBid, targetBidAmount);
    assert.strictEqual(updatedAuction.totalBids, 1);
    assert.strictEqual(updatedAuction.highestBidderId.toString(), successful[0].bidderId.toString());

    // Check successful bidder's wallet: $1050 held, $8950 available
    const winnerWallet = await Wallet.findOne({ userId: successful[0].bidderId });
    assert.strictEqual(winnerWallet.heldBalance, targetBidAmount);
    assert.strictEqual(winnerWallet.availableBalance, 10000 - targetBidAmount);
    assert.strictEqual(winnerWallet.totalBalance, 10000);

    // Check failed bidders' wallets: 0 held, 10000 available
    for (const fail of failed) {
      const w = await Wallet.findOne({ userId: fail.bidderId });
      assert.strictEqual(w.heldBalance, 0, 'Failed bidder must not have any held balance');
      assert.strictEqual(w.availableBalance, 10000, 'Failed bidder available balance must remain intact');
    }
  });

  it('Concurrent Escalating Bids: 20 simultaneous bids with increasing amounts maintain exact highest bid & valid holds', async () => {
    const now = new Date();
    const auction2 = await Auction.create({
      title: 'Escalating Concurrency Test Vintage Patek',
      description: 'Stress testing escalating bids',
      category: 'Watches',
      sellerId: seller._id,
      startingPrice: 500,
      currentHighestBid: 0,
      minIncrement: 20,
      startTime: new Date(now.getTime() - 10000),
      endTime: new Date(now.getTime() + 600000),
      status: 'LIVE',
      totalBids: 0
    });

    const testBidders = bidders.slice(0, 20);

    // Bidders submit varying bids from $550 to $1500 concurrently
    const promises = testBidders.map((bidder, idx) => {
      const bidAmt = 550 + (idx * 50); // $550, $600, $650, ... $1500
      return placeBidAtomic({
        auctionId: auction2._id,
        bidderId: bidder._id,
        amount: bidAmt
      })
        .then(res => ({ success: true, bidderId: bidder._id, amount: bidAmt }))
        .catch(err => ({ success: false, bidderId: bidder._id, amount: bidAmt, error: err.message }));
    });

    const results = await Promise.all(promises);
    const successful = results.filter(r => r.success);
    console.log(`[Concurrency Test 2] Sent 20 varying concurrent bids: ${successful.length} succeeded`);

    const finalAuction = await Auction.findById(auction2._id);
    const highestRecordedBid = finalAuction.currentHighestBid;

    // The current highest bid must match the highest bidder's active hold
    const highestBidderWallet = await Wallet.findOne({ userId: finalAuction.highestBidderId });
    assert.strictEqual(highestBidderWallet.heldBalance, highestRecordedBid);

    // All other bidders must have 0 held balance for this auction
    const outbidBidders = testBidders.filter(b => b._id.toString() !== finalAuction.highestBidderId.toString());
    for (const b of outbidBidders) {
      const w = await Wallet.findOne({ userId: b._id });
      // Only wallet holds from test 1 may exist, no rogue holds from auction2
      assert(w.heldBalance <= 1050, 'Outbid bidders must not have lingering holds');
      assert.strictEqual(w.availableBalance + w.heldBalance, 10000, 'Total balance invariant must be preserved');
    }
  });

  it('Wallet Hold Invariant: Bidder cannot bid more than their available balance', async () => {
    const poorBidder = await User.create({
      name: 'Poor Bidder',
      email: `poor_${Date.now()}@test.com`,
      password: 'password123',
      role: 'BIDDER'
    });
    await Wallet.create({
      userId: poorBidder._id,
      availableBalance: 200,
      heldBalance: 0
    });

    try {
      await placeBidAtomic({
        auctionId: auction._id,
        bidderId: poorBidder._id,
        amount: 5000 // far exceeds $200
      });
      assert.fail('Should have thrown insufficient balance error');
    } catch (err) {
      assert(err.message.includes('Insufficient wallet balance'));
    }

    const checkWallet = await Wallet.findOne({ userId: poorBidder._id });
    assert.strictEqual(checkWallet.availableBalance, 200);
    assert.strictEqual(checkWallet.heldBalance, 0);
  });
});
