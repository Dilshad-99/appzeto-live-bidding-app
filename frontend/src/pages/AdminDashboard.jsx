import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Flame,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Clock,
  Ban,
  Activity,
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [allAuctions, setAllAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedActionAuction, setSelectedActionAuction] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const [dashRes, auctionsRes] = await Promise.all([
        api.getAdminDashboard(),
        api.getAuctions(),
      ]);

      if (dashRes.success) {
        setDashboardData(dashRes.data);
      }
      if (auctionsRes.success) {
        setAllAuctions(auctionsRes.data);
      }
    } catch (err) {
      console.error('[Admin Dashboard Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchDashboard();
    }
  }, [user]);

  if (user?.role !== 'ADMIN') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-amber-50 text-[#D4AF37] border border-amber-200 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldAlert size={24} />
        </div>
        <h2 className="text-xl font-extrabold font-heading text-black">Admin Access Required</h2>
        <p className="text-xs text-slate-500">
          Please click on <strong>Elena (Admin)</strong> in the top demo banner to access admin oversight.
        </p>
      </div>
    );
  }

  if (loading || !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-xs text-slate-500 font-bold">
        Loading platform metrics...
      </div>
    );
  }

  const { metrics, categoryStats } = dashboardData;

  const handleApprove = async (auctionId) => {
    try {
      setActionLoading(true);
      const res = await api.approveAuction(auctionId);
      if (res.success) {
        fetchDashboard();
      }
    } catch (err) {
      alert(err.message || 'Error approving auction');
    } finally {
      setActionLoading(false);
    }
  };

  const handleForceCancel = async (e) => {
    e.preventDefault();
    if (!selectedActionAuction) return;

    try {
      setActionLoading(true);
      const res = await api.cancelAuction(selectedActionAuction._id, cancelReason || 'Admin force cancelled');
      if (res.success) {
        setSelectedActionAuction(null);
        setCancelReason('');
        fetchDashboard();
      }
    } catch (err) {
      alert(err.message || 'Error cancelling auction');
    } finally {
      setActionLoading(false);
    }
  };

  const draftAuctions = allAuctions.filter((a) => a.status === 'DRAFT');
  const activeAuctions = allAuctions.filter((a) => a.status === 'LIVE' || a.status === 'SCHEDULED');

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-black tracking-tight">
              Admin Platform Oversight
            </h1>
            <span className="px-2.5 py-0.5 bg-amber-50 text-black border border-amber-300 rounded-full text-xs font-extrabold">
              Root Control
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time auction lifecycle management, settlement GMV, and force cancellations.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="btn-secondary py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 self-start sm:self-auto"
        >
          <Activity size={15} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="card-surface p-4 bg-white border border-slate-200 space-y-1">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Settled GMV</div>
          <div className="text-2xl font-extrabold text-black font-mono">${metrics.settledGmv.toFixed(0)}</div>
          <div className="text-[10px] text-emerald-600 font-bold">{metrics.settledAuctions} settled items</div>
        </div>

        <div className="card-surface p-4 bg-white border border-slate-200 space-y-1">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Live Active</div>
          <div className="text-2xl font-extrabold text-emerald-600 font-mono">{metrics.liveAuctions}</div>
          <div className="text-[10px] text-emerald-700 font-bold">Accepting bids now</div>
        </div>

        <div className="card-surface p-4 bg-white border border-slate-200 space-y-1">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Total Bids</div>
          <div className="text-2xl font-extrabold text-black font-mono">{metrics.totalBids}</div>
          <div className="text-[10px] text-slate-500 font-bold">Platform total</div>
        </div>

        <div className="card-surface p-4 bg-white border border-slate-200 space-y-1">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Drafts</div>
          <div className="text-2xl font-extrabold text-amber-600 font-mono">{metrics.draftAuctions}</div>
          <div className="text-[10px] text-amber-700 font-bold">Awaiting approval</div>
        </div>

        <div className="card-surface p-4 bg-white border border-slate-200 space-y-1">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">No Winner</div>
          <div className="text-2xl font-extrabold text-slate-600 font-mono">{metrics.closedNoWinner}</div>
          <div className="text-[10px] text-slate-500 font-bold">Unmet reserve / 0 bids</div>
        </div>

        <div className="card-surface p-4 bg-white border border-slate-200 space-y-1">
          <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Cancelled</div>
          <div className="text-2xl font-extrabold text-red-600 font-mono">{metrics.cancelledAuctions}</div>
          <div className="text-[10px] text-red-700 font-bold">Holds refunded</div>
        </div>
      </div>

      {/* Category Performance Breakdown */}
      <div className="card-surface p-5 sm:p-6 bg-white border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-[#D4AF37]" />
            <h3 className="font-heading font-extrabold text-base text-black">
              Category Performance & GMV Volume
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-bold">{categoryStats?.length || 0} Categories</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-1">
          {categoryStats?.map((cat) => (
            <div key={cat.category} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="text-xs font-extrabold text-black line-clamp-1">{cat.category}</div>
              <div className="flex items-baseline justify-between">
                <span className="text-lg font-extrabold text-black font-mono">${cat.gmv.toFixed(0)}</span>
                <span className="text-[11px] text-slate-500 font-bold">{cat.bids} bids</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#D4AF37] to-[#B8860B]"
                  style={{
                    width: `${Math.min(100, (cat.auctions / (metrics.totalAuctions || 1)) * 100)}%`,
                  }}
                ></div>
              </div>
              <div className="text-[10px] text-slate-500 font-medium">{cat.auctions} listings in category</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Approvals Table */}
      <div className="card-surface p-5 sm:p-6 bg-white border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-amber-500" />
            <h3 className="font-heading font-extrabold text-base text-black">
              Pending Draft Approvals ({draftAuctions.length})
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-bold">Review listings</span>
        </div>

        <div className="overflow-x-auto">
          {draftAuctions.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-extrabold tracking-wider">
                  <th className="py-3 px-3">Item</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Starting Price</th>
                  <th className="py-3 px-3">Reserve</th>
                  <th className="py-3 px-3">Seller</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {draftAuctions.map((auc) => (
                  <tr key={auc._id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={auc.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}
                          alt={auc.title}
                          className="w-10 h-10 rounded-lg object-cover bg-slate-200"
                        />
                        <div>
                          <div className="font-extrabold text-black line-clamp-1">{auc.title}</div>
                          <div className="text-[10px] text-slate-400">Starts: {new Date(auc.startTime).toLocaleString()}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-700">{auc.category}</td>
                    <td className="py-3 px-3 font-mono font-extrabold text-black">${auc.startingPrice.toFixed(2)}</td>
                    <td className="py-3 px-3 font-mono text-slate-600">${auc.reservePrice || 0}</td>
                    <td className="py-3 px-3 text-slate-700 font-bold">{auc.sellerId?.name || 'Seller'}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => handleApprove(auc._id)}
                        disabled={actionLoading}
                        className="btn-primary text-xs py-1.5 px-3.5 rounded-xl font-extrabold inline-flex items-center gap-1"
                      >
                        <CheckCircle2 size={14} />
                        <span>Approve</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No draft listings awaiting approval.
            </div>
          )}
        </div>
      </div>

      {/* Active Auctions & Force Cancel */}
      <div className="card-surface p-5 sm:p-6 bg-white border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Flame size={18} className="text-orange-500" />
            <h3 className="font-heading font-extrabold text-base text-black">
              Active Auction Emergency Controls ({activeAuctions.length})
            </h3>
          </div>
        </div>

        <div className="overflow-x-auto">
          {activeAuctions.length > 0 ? (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-slate-400 uppercase font-extrabold tracking-wider">
                  <th className="py-3 px-3">Item</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Highest Bid</th>
                  <th className="py-3 px-3">Total Bids</th>
                  <th className="py-3 px-3">End Time</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activeAuctions.map((auc) => (
                  <tr key={auc._id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-3 font-extrabold text-black max-w-xs truncate">{auc.title}</td>
                    <td className="py-3 px-3">
                      <span className={`badge ${auc.status === 'LIVE' ? 'badge-live' : 'badge-scheduled'}`}>
                        {auc.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono font-extrabold text-black">
                      ${(auc.currentHighestBid || auc.startingPrice).toFixed(2)}
                    </td>
                    <td className="py-3 px-3 text-slate-700 font-bold">{auc.totalBids} bids</td>
                    <td className="py-3 px-3 text-slate-400">{new Date(auc.endTime).toLocaleString()}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => setSelectedActionAuction(auc)}
                        className="btn-secondary py-1 px-3 text-xs text-red-600 border-red-200 hover:bg-red-50 inline-flex items-center gap-1 font-bold rounded-lg"
                      >
                        <Ban size={13} />
                        <span>Force Cancel</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 font-medium">
              No active listings running currently.
            </div>
          )}
        </div>
      </div>

      {/* Force Cancel Modal */}
      {selectedActionAuction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-xl">
                <AlertTriangle size={24} />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-lg text-black">Confirm Force Cancel</h3>
                <p className="text-xs text-slate-500">Auction: {selectedActionAuction.title}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Cancelling will immediately end bidding and <strong>atomically refund all holds</strong> back to bidders' available balances.
            </p>

            <form onSubmit={handleForceCancel} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-black mb-1">Cancellation Reason</label>
                <input
                  type="text"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="e.g. Seller request / terms issue"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedActionAuction(null)}
                  className="flex-1 btn-secondary text-xs py-2.5 rounded-xl font-bold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 btn-primary bg-red-600 hover:bg-red-700 text-xs py-2.5 font-bold shadow-none rounded-xl"
                >
                  {actionLoading ? 'Refunding...' : 'Confirm & Refund Holds'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
