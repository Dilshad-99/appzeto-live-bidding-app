import { Wallet } from '../models/Wallet.js';
import { Transaction } from '../models/Transaction.js';
import { emitToUser } from '../services/socketService.js';

export const getWallet = async (req, res) => {
  try {
    let wallet = await Wallet.findOne({ userId: req.user._id });

    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.user._id,
        availableBalance: req.user.role === 'BIDDER' ? 5000 : 0,
        heldBalance: 0
      });
    }

    const transactions = await Transaction.find({ userId: req.user._id })
      .populate('auctionId', 'title')
      .sort({ createdAt: -1 })
      .limit(30);

    return res.status(200).json({
      success: true,
      data: {
        availableBalance: wallet.availableBalance,
        heldBalance: wallet.heldBalance,
        totalBalance: wallet.totalBalance,
        currency: wallet.currency,
        transactions
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const topupWallet = async (req, res) => {
  try {
    const { amount } = req.body;
    const numAmount = Number(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Please provide a valid positive top-up amount' });
    }

    let wallet = await Wallet.findOne({ userId: req.user._id });
    if (!wallet) {
      wallet = await Wallet.create({
        userId: req.user._id,
        availableBalance: 0,
        heldBalance: 0
      });
    }

    wallet.availableBalance += numAmount;
    await wallet.save();

    const tx = await Transaction.create({
      walletId: wallet._id,
      userId: req.user._id,
      type: 'TOPUP',
      amount: numAmount,
      description: `Manual wallet top-up of $${numAmount.toFixed(2)}`,
      balanceAfter: wallet.availableBalance,
      heldAfter: wallet.heldBalance
    });

    emitToUser(req.user._id, 'wallet:updated', {
      availableBalance: wallet.availableBalance,
      heldBalance: wallet.heldBalance,
      totalBalance: wallet.totalBalance
    });

    return res.status(200).json({
      success: true,
      message: `Successfully topped up $${numAmount.toFixed(2)} to your wallet`,
      data: {
        availableBalance: wallet.availableBalance,
        heldBalance: wallet.heldBalance,
        totalBalance: wallet.totalBalance,
        transaction: tx
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
