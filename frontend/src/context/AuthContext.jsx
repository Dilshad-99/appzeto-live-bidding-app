import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import { initSocketClient } from '../services/socket';

const AuthContext = createContext(null);

export const DEMO_USERS = [
  { name: 'Alex Rivera (Bidder 1)', email: 'bidder1@auctionhub.com', password: 'password123', role: 'BIDDER' },
  { name: 'Sophia Chen (Bidder 2)', email: 'bidder2@auctionhub.com', password: 'password123', role: 'BIDDER' },
  { name: 'Marcus Sterling (Seller)', email: 'seller@auctionhub.com', password: 'password123', role: 'SELLER' },
  { name: 'Elena Rostova (Admin)', email: 'admin@auctionhub.com', password: 'password123', role: 'ADMIN' },
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('auction_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success) {
            setUser(res.user);
            initSocketClient(token);
          }
        } catch (err) {
          console.error('[Auth Init Error]', err);
          logout();
        }
      } else {
        // Initialize guest socket
        initSocketClient(null);
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success) {
      localStorage.setItem('auction_token', res.token);
      setToken(res.token);
      setUser(res.user);
      initSocketClient(res.token);
      return res;
    }
  };

  const register = async (name, email, password, role) => {
    const res = await api.register({ name, email, password, role });
    if (res.success) {
      localStorage.setItem('auction_token', res.token);
      setToken(res.token);
      setUser(res.user);
      initSocketClient(res.token);
      return res;
    }
  };

  const logout = () => {
    localStorage.removeItem('auction_token');
    setToken(null);
    setUser(null);
    initSocketClient(null);
  };

  const switchDemoUser = async (demoEmail) => {
    const demo = DEMO_USERS.find(u => u.email === demoEmail);
    if (demo) {
      return await login(demo.email, demo.password);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, switchDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
