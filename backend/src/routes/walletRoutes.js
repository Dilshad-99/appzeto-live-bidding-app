import express from 'express';
import { getWallet, topupWallet } from '../controllers/walletController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.get('/', getWallet);
router.post('/topup', topupWallet);

export default router;
