const rawApiUrl = import.meta.env.VITE_API_URL || '';
const API_BASE = rawApiUrl.endsWith('/api')
  ? rawApiUrl
  : rawApiUrl
  ? `${rawApiUrl.replace(/\/+$/, '')}/api`
  : '/api';

export const apiRequest = async (endpoint, options = {}) => {
  const token = localStorage.getItem('auction_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      // Clear invalid stale token from previous DB instances
      localStorage.removeItem('auction_token');
    }
    throw new Error(data.message || 'An error occurred while fetching data');
  }

  return data;
};

export const api = {
  // Auth
  login: (credentials) => apiRequest('/auth/login', { method: 'POST', body: credentials }),
  register: (data) => apiRequest('/auth/register', { method: 'POST', body: data }),
  getMe: () => apiRequest('/auth/me'),

  // Auctions
  getAuctions: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiRequest(`/auctions${query ? `?${query}` : ''}`);
  },
  getAuctionById: (id) => apiRequest(`/auctions/${id}`),
  createAuction: (data) => apiRequest('/auctions', { method: 'POST', body: data }),
  updateAuction: (id, data) => apiRequest(`/auctions/${id}`, { method: 'PUT', body: data }),
  deleteAuction: (id) => apiRequest(`/auctions/${id}`, { method: 'DELETE' }),
  approveAuction: (id) => apiRequest(`/auctions/${id}/approve`, { method: 'POST' }),
  cancelAuction: (id, reason) => apiRequest(`/auctions/${id}/cancel`, { method: 'POST', body: { reason } }),

  // Bids
  getAuctionBids: (auctionId) => apiRequest(`/auctions/${auctionId}/bids`),
  placeBid: (auctionId, amount) => apiRequest(`/auctions/${auctionId}/bids`, { method: 'POST', body: { amount } }),
  getMyBids: () => apiRequest('/me/bids'),

  // Wallet
  getWallet: () => apiRequest('/wallet'),
  topupWallet: (amount) => apiRequest('/wallet/topup', { method: 'POST', body: { amount } }),

  // Admin
  getAdminDashboard: () => apiRequest('/admin/dashboard'),
};
