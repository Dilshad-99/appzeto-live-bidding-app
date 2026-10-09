import express from 'express';
import {
  getAuctions,
  getAuctionById,
  createAuction,
  updateAuction,
  deleteAuction,
  approveAuction,
  cancelAuction
} from '../controllers/auctionController.js';
import { getAuctionBids, placeBid } from '../controllers/bidController.js';
import { protect, restrictTo } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(getAuctions)
  .post(protect, restrictTo('SELLER', 'ADMIN'), createAuction);

router.route('/:id')
  .get(getAuctionById)
  .put(protect, restrictTo('SELLER', 'ADMIN'), updateAuction)
  .delete(protect, restrictTo('SELLER', 'ADMIN'), deleteAuction);

router.post('/:id/approve', protect, restrictTo('ADMIN'), approveAuction);
router.post('/:id/cancel', protect, restrictTo('ADMIN'), cancelAuction);

// Bids for specific auction
router.route('/:id/bids')
  .get(getAuctionBids)
  .post(protect, restrictTo('BIDDER', 'ADMIN'), placeBid);

export default router;
