import { Auction } from '../models/Auction.js';
import { Bid } from '../models/Bid.js';
import { User } from '../models/User.js';
import { Transaction } from '../models/Transaction.js';

export const getAdminDashboard = async (req, res) => {
  try {
    // 1. Auction counts by state
    const states = ['DRAFT', 'SCHEDULED', 'LIVE', 'CLOSED', 'SETTLED', 'CANCELLED'];
    const stateCountsPromise = Auction.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // 2. Total bids count
    const totalBidsPromise = Bid.countDocuments();

    // 3. Settled GMV (Gross Merchandise Value)
    const gmvPromise = Auction.aggregate([
      { $match: { status: 'SETTLED' } },
      { $group: { _id: null, totalGmv: { $sum: '$winningBid' } } }
    ]);

    // 4. Closed without winner
    const closedNoWinnerPromise = Auction.countDocuments({ status: 'CLOSED', winnerId: null });

    // 5. Total Users count
    const usersCountPromise = User.countDocuments();

    // 6. Recent Bids
    const recentBidsPromise = Bid.find()
      .populate('bidderId', 'name email avatar')
      .populate('auctionId', 'title category currentHighestBid status')
      .sort({ createdAt: -1 })
      .limit(10);

    // 7. Category Distribution Chart Data
    const categoryDistributionPromise = Auction.aggregate([
      {
        $group: {
          _id: '$category',
          totalAuctions: { $sum: 1 },
          totalBids: { $sum: '$totalBids' },
          gmv: {
            $sum: {
              $cond: [{ $eq: ['$status', 'SETTLED'] }, '$winningBid', 0]
            }
          }
        }
      },
      { $sort: { totalAuctions: -1 } }
    ]);

    // 8. Daily Bid Volume (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const timelineDataPromise = Bid.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          bidsCount: { $sum: 1 },
          volume: { $sum: '$amount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const [
      stateCountsRaw,
      totalBids,
      gmvRaw,
      closedNoWinner,
      totalUsers,
      recentBids,
      categoryStats,
      timelineStats
    ] = await Promise.all([
      stateCountsPromise,
      totalBidsPromise,
      gmvPromise,
      closedNoWinnerPromise,
      usersCountPromise,
      recentBidsPromise,
      categoryDistributionPromise,
      timelineDataPromise
    ]);

    const stateCounts = {
      DRAFT: 0,
      SCHEDULED: 0,
      LIVE: 0,
      CLOSED: 0,
      SETTLED: 0,
      CANCELLED: 0
    };

    let totalAuctions = 0;
    stateCountsRaw.forEach(item => {
      if (item._id && stateCounts[item._id] !== undefined) {
        stateCounts[item._id] = item.count;
      }
      totalAuctions += item.count;
    });

    const settledGmv = gmvRaw.length > 0 ? gmvRaw[0].totalGmv : 0;

    return res.status(200).json({
      success: true,
      data: {
        metrics: {
          totalAuctions,
          liveAuctions: stateCounts.LIVE,
          scheduledAuctions: stateCounts.SCHEDULED,
          draftAuctions: stateCounts.DRAFT,
          settledAuctions: stateCounts.SETTLED,
          closedNoWinner,
          cancelledAuctions: stateCounts.CANCELLED,
          totalBids,
          settledGmv,
          totalUsers
        },
        stateCounts,
        categoryStats: categoryStats.map(c => ({
          category: c._id || 'Uncategorized',
          auctions: c.totalAuctions,
          bids: c.totalBids,
          gmv: c.gmv
        })),
        timelineStats: timelineStats.map(t => ({
          date: t._id,
          bids: t.bidsCount,
          volume: t.volume
        })),
        recentBids
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
