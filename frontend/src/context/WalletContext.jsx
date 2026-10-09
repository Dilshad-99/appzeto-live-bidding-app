import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';

const WalletContext = createContext(null);

export const WalletProvider = ({ children }) => {
  const { user } = useAuth();
  const [wallet, setWallet] = useState({
    availableBalance: 0,
    heldBalance: 0,
    totalBalance: 0,
    transactions: [],
  });
  const [loading, setLoading] = useState(false);

  const fetchWallet = useCallback(async () => {
    if (!user) {
      setWallet({ availableBalance: 0, heldBalance: 0, totalBalance: 0, transactions: [] });
      return;
    }

    try {
      setLoading(true);
      const res = await api.getWallet();
      if (res.success) {
        setWallet(res.data);
      }
    } catch (err) {
      console.error('[Wallet Fetch Error]', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  // Listen to real-time wallet updates via Socket
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !user) return;

    const handleWalletUpdated = (data) => {
      console.log('[Socket] Wallet updated received:', data);
      setWallet(prev => ({
        ...prev,
        availableBalance: data.availableBalance,
        heldBalance: data.heldBalance,
        totalBalance: data.totalBalance,
      }));
      // Also refresh recent transactions
      fetchWallet();
    };

    socket.on('wallet:updated', handleWalletUpdated);

    return () => {
      socket.off('wallet:updated', handleWalletUpdated);
    };
  }, [user, fetchWallet]);

  const topup = async (amount) => {
    const res = await api.topupWallet(amount);
    if (res.success) {
      setWallet(prev => ({
        ...prev,
        availableBalance: res.data.availableBalance,
        heldBalance: res.data.heldBalance,
        totalBalance: res.data.totalBalance,
        transactions: [res.data.transaction, ...(prev.transactions || [])],
      }));
    }
    return res;
  };

  return (
    <WalletContext.Provider value={{ wallet, loading, fetchWallet, topup }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
