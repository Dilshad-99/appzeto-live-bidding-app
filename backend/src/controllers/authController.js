import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Wallet } from '../models/Wallet.js';
import { config } from '../config/env.js';

const generateToken = (id) => {
  return jwt.sign({ id }, config.jwtSecret, {
    expiresIn: config.jwtExpiresIn,
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role, avatar } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const validRole = ['BIDDER', 'SELLER', 'ADMIN'].includes(role) ? role : 'BIDDER';

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role: validRole,
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
    });

    // Initialize wallet with demo balance for Bidders
    const initialBalance = validRole === 'BIDDER' ? 5000.00 : 0.00;
    const wallet = await Wallet.create({
      userId: user._id,
      availableBalance: initialBalance,
      heldBalance: 0.00
    });

    const token = generateToken(user._id);

    return res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      wallet: {
        availableBalance: wallet.availableBalance,
        heldBalance: wallet.heldBalance,
        totalBalance: wallet.totalBalance
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    let wallet = await Wallet.findOne({ userId: user._id });
    if (!wallet) {
      wallet = await Wallet.create({
        userId: user._id,
        availableBalance: user.role === 'BIDDER' ? 5000 : 0,
        heldBalance: 0
      });
    }

    const token = generateToken(user._id);

    return res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      wallet: {
        availableBalance: wallet.availableBalance,
        heldBalance: wallet.heldBalance,
        totalBalance: wallet.totalBalance
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const wallet = await Wallet.findOne({ userId: req.user._id });

    return res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      wallet: wallet ? {
        availableBalance: wallet.availableBalance,
        heldBalance: wallet.heldBalance,
        totalBalance: wallet.totalBalance
      } : null
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
