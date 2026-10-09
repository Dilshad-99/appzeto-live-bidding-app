import express from 'express';
import { getMyBids } from '../controllers/bidController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/bids', getMyBids);

export default router;
