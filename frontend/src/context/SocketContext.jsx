import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSocket } from '../services/socket';
import { useAuth } from './AuthContext';
import confetti from 'canvas-confetti';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [activeAuctionUpdates, setActiveAuctionUpdates] = useState({});

  const addNotification = (notif) => {
    const id = Date.now() + Math.random().toString();
    const newNotif = { id, ...notif, time: new Date() };
    setNotifications(prev => [newNotif, ...prev.slice(0, 7)]);

    // Auto dismiss toast after 6 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 6000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    // Outbid notification (targeted to this user)
    const handleOutbid = (data) => {
      console.log('[Socket] Outbid event:', data);
      addNotification({
        type: 'OUTBID',
        title: 'Outbid Alert!',
        message: data.message,
        auctionId: data.auctionId,
      });
    };

    // Won notification
    const handleWon = (data) => {
      console.log('[Socket] Won event:', data);
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 }
      });
      addNotification({
        type: 'WON',
        title: '🎉 You Won the Auction!',
        message: `Congratulations! You won '${data.auctionTitle}' for $${data.amount.toFixed(2)}!`,
        auctionId: data.auctionId,
      });
    };

    // Global auction status changed
    const handleStatusChanged = (data) => {
      console.log('[Socket] Status changed:', data);
      setActiveAuctionUpdates(prev => ({
        ...prev,
        [data.auctionId]: data
      }));
    };

    socket.on('auction:outbid', handleOutbid);
    socket.on('auction:won', handleWon);
    socket.on('auction:status_changed', handleStatusChanged);

    return () => {
      socket.off('auction:outbid', handleOutbid);
      socket.off('auction:won', handleWon);
      socket.off('auction:status_changed', handleStatusChanged);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ notifications, removeNotification, addNotification, activeAuctionUpdates }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
