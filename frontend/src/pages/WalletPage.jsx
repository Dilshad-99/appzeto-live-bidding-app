import React, { useState, useEffect } from 'react';
import { useWallet } from '../context/WalletContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { PaymentGatewayModal } from '../components/PaymentGatewayModal';
import { Link } from 'react-router-dom';
import {
  Wallet,
  Lock,
  ArrowUpRight,
  PlusCircle,
  Receipt,
  Gavel,
  History,
  CreditCard,
} from 'lucide-react';

export const WalletPage = () => {
  const { user } = useAuth();
  const { wallet, fetchWallet } = useWallet();
  const [myBids, setMyBids] = useState([]);
  const [loadingBids, setLoadingBids] = useState(true);
  const [activeTab, setActiveTab] = useState('BIDS');
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);

  useEffect(() => {
    const loadBids = async () => {
      try {
        setLoadingBids(true);
        const res = await api.getMyBids();
        if (res.success) {
          setMyBids(res.data);
        }
      } catch (err) {
        console.error('[Load Bids Error]', err);
      } finally {
        setLoadingBids(false);
      }
    };

    if (user) {
      loadBids();
      fetchWallet();
    }
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 bg-amber-50 text-[#D4AF37] border border-amber-200 rounded-2xl flex items-center justify-center mx-auto">
          <Wallet size={24} />
        </div>
        <h2 className="text-xl font-extrabold font-heading text-black">Wallet Sign-In Required</h2>
        <p className="text-xs text-slate-500">
          Please select a demo user from the top banner to inspect balances and transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-4 sm:py-5 space-y-4 sm:space-y-5">
      {/* Header with Payment Gateway Top-up Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black font-heading text-[#0F172A] tracking-tight">
            Wallet & Bidding Dashboard
          </h1>
          <p className="text-xs text-slate-800 font-medium mt-0.5">
            Real-time balance tracking, active bid holds, and settlement history.
          </p>
        </div>

        <button
          onClick={() => setIsGatewayOpen(true)}
          className="btn-primary py-2 px-4 rounded-xl text-xs sm:text-sm font-black shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
        >
          <CreditCard size={15} />
          <span>Deposit with Payment Gateway</span>
        </button>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="card-surface p-4 sm:p-5 bg-white border-l-4 border-l-emerald-500 space-y-1.5 border border-[#E8DEBE] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-[#8C6608] uppercase tracking-wider">
              Available Balance
            </span>
            <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200">
              <Wallet size={16} />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0F172A] font-mono">
            ${wallet.availableBalance.toFixed(2)}
          </div>
          <p className="text-[11px] text-emerald-800 font-extrabold">
            Available to place bids
          </p>
        </div>

        <div className="card-surface p-4 sm:p-5 bg-white border-l-4 border-l-[#D4AF37] space-y-1.5 border border-[#E8DEBE] shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-[#8C6608] uppercase tracking-wider">
              Locked in Active Holds
            </span>
            <div className="p-1.5 bg-amber-50 text-amber-700 rounded-lg border border-amber-200">
              <Lock size={16} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-[#B8860B] font-mono">
            ${wallet.heldBalance.toFixed(2)}
          </div>
          <p className="text-[11px] text-amber-800 font-bold">
            Held on highest bids (refunded if outbid)
          </p>
        </div>

        <div className="card-surface p-5 sm:p-6 bg-white border-l-4 border-l-black space-y-2 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
              Total Account Net Worth
            </span>
            <div className="p-2 bg-slate-100 text-black rounded-lg">
              <Receipt size={18} />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-black font-mono">
            ${wallet.totalBalance.toFixed(2)}
          </div>
          <p className="text-[11px] text-slate-500 font-bold">
            Available + Held balance
          </p>
        </div>
      </div>

      {/* Tabs Container */}
      <div className="card-surface bg-white p-4 sm:p-6 space-y-6 border border-slate-200">
        <div className="flex items-center gap-3 sm:gap-6 border-b border-slate-100 pb-3">
          <button
            onClick={() => setActiveTab('BIDS')}
            className={`flex items-center gap-1.5 pb-2 text-xs sm:text-sm font-extrabold border-b-2 transition-all ${
              activeTab === 'BIDS'
                ? 'border-[#D4AF37] text-black'
                : 'border-transparent text-slate-500 hover:text-black'
            }`}
          >
            <Gavel size={15} />
            <span>My Bids ({myBids.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`flex items-center gap-1.5 pb-2 text-xs sm:text-sm font-extrabold border-b-2 transition-all ${
              activeTab === 'LEDGER'
                ? 'border-[#D4AF37] text-black'
                : 'border-transparent text-slate-500 hover:text-black'
            }`}
          >
            <History size={15} />
            <span>Transaction Ledger ({wallet.transactions?.length || 0})</span>
          </button>
        </div>

        {/* Tab 1: My Bids Table */}
        {activeTab === 'BIDS' && (
          <div className="overflow-x-auto">
            {loadingBids ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading your bids...</div>
            ) : myBids.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-extrabold tracking-wider">
                    <th className="py-3 px-3">Item</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">Your Bid</th>
                    <th className="py-3 px-3">Current Highest</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {myBids.map((bid) => {
                    const auc = bid.auctionId;
                    if (!auc) return null;

                    const isHighest = (auc.highestBidderId?._id || auc.highestBidderId)?.toString() === user.id?.toString();
                    const isWon = auc.status === 'SETTLED' && (auc.winnerId?._id || auc.winnerId)?.toString() === user.id?.toString();

                    let statusBadge = null;
                    if (isWon) {
                      statusBadge = <span className="badge badge-settled">Won 🏆</span>;
                    } else if (auc.status === 'LIVE' && isHighest) {
                      statusBadge = <span className="badge badge-live">Winning 🟢</span>;
                    } else if (auc.status === 'LIVE' && !isHighest) {
                      statusBadge = <span className="badge badge-cancelled">Outbid 🔴</span>;
                    } else {
                      statusBadge = <span className="badge badge-closed">{auc.status}</span>;
                    }

                    return (
                      <tr key={bid._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={auc.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}
                              alt={auc.title}
                              className="w-10 h-10 rounded-lg object-cover bg-slate-100"
                            />
                            <div>
                              <div className="font-extrabold text-black line-clamp-1">{auc.title}</div>
                              <div className="text-[10px] text-slate-400">ID: #{auc._id?.slice(-6)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-bold">{auc.category}</td>
                        <td className="py-3 px-3 font-mono font-extrabold text-black">${bid.amount.toFixed(2)}</td>
                        <td className="py-3 px-3 font-mono font-extrabold text-[#B8860B]">${auc.currentHighestBid?.toFixed(2)}</td>
                        <td className="py-3 px-3">{statusBadge}</td>
                        <td className="py-3 px-3 text-slate-400">{new Date(bid.createdAt).toLocaleDateString()}</td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            to={`/auctions/${auc._id}`}
                            className="inline-flex items-center gap-1 font-extrabold text-black hover:text-[#B8860B] hover:underline"
                          >
                            <span>View</span>
                            <ArrowUpRight size={13} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                <Gavel size={24} className="mx-auto text-slate-300" />
                <p>You have not placed any bids yet.</p>
                <Link to="/" className="btn-secondary text-xs py-1.5 px-3 rounded-lg inline-flex font-bold">
                  Browse Marketplace
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Transaction Ledger */}
        {activeTab === 'LEDGER' && (
          <div className="overflow-x-auto">
            {wallet.transactions?.length > 0 ? (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 uppercase font-extrabold tracking-wider">
                    <th className="py-3 px-3">Type</th>
                    <th className="py-3 px-3">Description</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Avail Balance</th>
                    <th className="py-3 px-3">Held Balance</th>
                    <th className="py-3 px-3">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {wallet.transactions.map((tx) => {
                    const isCredit = tx.type === 'TOPUP' || tx.type === 'RELEASE' || tx.type === 'CREDIT_SELLER' || tx.type === 'REFUND';

                    return (
                      <tr key={tx._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              tx.type === 'TOPUP'
                                ? 'bg-green-100 text-green-800'
                                : tx.type === 'HOLD'
                                ? 'bg-amber-100 text-amber-900'
                                : tx.type === 'RELEASE'
                                ? 'bg-blue-100 text-blue-800'
                                : tx.type === 'DEBIT_WIN'
                                ? 'bg-purple-100 text-purple-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {tx.type}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-800 font-medium max-w-xs truncate">{tx.description}</td>
                        <td className={`py-3 px-3 font-mono font-extrabold ${isCredit ? 'text-green-600' : 'text-black'}`}>
                          {isCredit ? '+' : '-'}${tx.amount.toFixed(2)}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700 font-bold">${tx.balanceAfter?.toFixed(2)}</td>
                        <td className="py-3 px-3 font-mono text-amber-700 font-bold">${tx.heldAfter?.toFixed(2)}</td>
                        <td className="py-3 px-3 text-slate-400">{new Date(tx.createdAt).toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 font-medium">
                No ledger transactions recorded yet.
              </div>
            )}
          </div>
        )}
      </div>

      <PaymentGatewayModal isOpen={isGatewayOpen} onClose={() => setIsGatewayOpen(false)} />
    </div>
  );
};
