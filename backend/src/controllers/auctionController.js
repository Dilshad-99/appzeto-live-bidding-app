import { Auction } from '../models/Auction.js';
import { cancelAuctionAtomic } from '../services/auctionScheduler.js';
import { emitToAuction, emitGlobal } from '../services/socketService.js';

export const getAuctions = async (req, res) => {
  try {
    const { status, category, search, sellerId, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = {};

    if (status) {
      if (status.includes(',')) {
        query.status = { $in: status.split(',') };
      } else {
        query.status = status;
      }
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (sellerId) {
      query.sellerId = sellerId;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const auctions = await Auction.find(query)
      .populate('sellerId', 'name email avatar')
      .populate('highestBidderId', 'name email avatar')
      .populate('winnerId', 'name email avatar')
      .sort(sort);

    return res.status(200).json({
      success: true,
      count: auctions.length,
      data: auctions
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuctionById = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
      .populate('sellerId', 'name email avatar')
      .populate('highestBidderId', 'name email avatar')
      .populate('winnerId', 'name email avatar');

    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    return res.status(200).json({ success: true, data: auction });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const createAuction = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      images,
      startingPrice,
      minIncrement = 10,
      reservePrice = 0,
      startTime,
      endTime
    } = req.body;

    if (!title || !description || !startingPrice || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, description, startingPrice, startTime, and endTime'
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid start or end date format' });
    }

    if (end <= start) {
      return res.status(400).json({ success: false, message: 'End time must be after start time' });
    }

    const auction = await Auction.create({
      title,
      description,
      category: category || 'Collectibles',
      images: Array.isArray(images) && images.length > 0 ? images : [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'
      ],
      sellerId: req.user._id,
      startingPrice: Number(startingPrice),
      currentHighestBid: 0,
      minIncrement: Number(minIncrement) || 10,
      reservePrice: Number(reservePrice) || 0,
      startTime: start,
      endTime: end,
      status: 'DRAFT',
    });

    return res.status(201).json({
      success: true,
      message: 'Auction created successfully in DRAFT state. Awaiting Admin approval.',
      data: auction
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    // Check ownership unless admin
    if (auction.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You can only edit your own auctions' });
    }

    // Rule: Cannot edit if received first bid or not in DRAFT
    if (auction.totalBids > 0) {
      return res.status(400).json({
        success: false,
        message: 'Auction cannot be edited once it has received bids'
      });
    }

    if (auction.status !== 'DRAFT' && req.user.role !== 'ADMIN') {
      return res.status(400).json({
        success: false,
        message: `Auction cannot be edited in '${auction.status}' state. Only DRAFT auctions can be edited.`
      });
    }

    const fieldsToUpdate = ['title', 'description', 'category', 'images', 'startingPrice', 'minIncrement', 'reservePrice', 'startTime', 'endTime'];
    fieldsToUpdate.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'startTime' || field === 'endTime') {
          auction[field] = new Date(req.body[field]);
        } else {
          auction[field] = req.body[field];
        }
      }
    });

    await auction.save();

    return res.status(200).json({
      success: true,
      message: 'Auction updated successfully',
      data: auction
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    if (auction.sellerId.toString() !== req.user._id.toString() && req.user.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'You can only delete your own auctions' });
    }

    if (auction.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: 'Only auctions in DRAFT state can be deleted'
      });
    }

    await Auction.findByIdAndDelete(req.params.id);

    return res.status(200).json({ success: true, message: 'Auction deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const approveAuction = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id);

    if (!auction) {
      return res.status(404).json({ success: false, message: 'Auction not found' });
    }

    if (auction.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        message: `Only DRAFT auctions can be approved. Current state: '${auction.status}'`
      });
    }

    const now = new Date();
    // If start time is already in the past or now, set to LIVE immediately, else SCHEDULED
    if (auction.startTime <= now && auction.endTime > now) {
      auction.status = 'LIVE';
    } else {
      auction.status = 'SCHEDULED';
    }

    await auction.save();

    emitToAuction(auction._id, 'auction:status_changed', { auctionId: auction._id, status: auction.status });
    emitGlobal('auction:status_changed', { auctionId: auction._id, status: auction.status });

    return res.status(200).json({
      success: true,
      message: `Auction approved successfully. Status is now '${auction.status}'`,
      data: auction
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const cancelAuction = async (req, res) => {
  try {
    const { reason } = req.body;
    const result = await cancelAuctionAtomic(req.params.id, reason || 'Cancelled by Admin');

    return res.status(200).json({
      success: true,
      message: 'Auction cancelled and all active holds released',
      data: result.auction
    });
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Error cancelling auction'
    });
  }
};
