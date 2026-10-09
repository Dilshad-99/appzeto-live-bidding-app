import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { getSocket } from '../services/socket';
import { useAuth } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { CountdownTimer } from '../components/CountdownTimer';
import { PaymentGatewayModal } from '../components/PaymentGatewayModal';
import {
  Gavel,
  ShieldCheck,
  Zap,
  Flame,
  ArrowLeft,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Radio,
  CreditCard,
  TrendingUp,
} from 'lucide-react';

export const AuctionDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const { wallet, fetchWallet } = useWallet();

  const [auction, setAuction] = useState(null);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);
  const [bidError, setBidError] = useState('');
  const [bidSuccess, setBidSuccess] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [snipingAlert, setSnipingAlert] = useState(false);
  const [isConnected, setIsConnected] = useState(true);

  const fetchAuctionData = async () => {
    try {
      setLoading(true);
      const [auctionRes, bidsRes] = await Promise.all([
        api.getAuctionById(id),
        api.getAuctionBids(id),
      ]);

      if (auctionRes.success) {
        setAuction(auctionRes.data);
        const isFirst = auctionRes.data.totalBids === 0;
        const minNext = isFirst
          ? auctionRes.data.startingPrice
          : auctionRes.data.currentHighestBid + auctionRes.data.minIncrement;
        setBidAmount(String(minNext));
      }

      if (bidsRes.success) {
        setBids(bidsRes.data);
      }
    } catch (err) {
      console.error('[Fetch Auction Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctionData();
  }, [id]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !id) return;

    socket.emit('join:auction', id);

    const handleBidPlaced = (data) => {
      console.log('[Socket] Bid placed event in room:', data);
      if (data.auctionId === id) {
        setAuction((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            currentHighestBid: data.currentHighestBid,
            highestBidderId: data.highestBidderId,
            totalBids: data.totalBids,
            endTime: data.endTime,
          };
        });

        if (data.bid) {
          setBids((prev) => {
            const incomingId = data.bid._id || data.bid.id;
            const filtered = prev.filter((b) => (b._id || b.id) !== incomingId);
            const markedOutbid = filtered.map((b) => ({
              ...b,
              status: 'OUTBID',
            }));
            return [{ ...data.bid, status: 'ACTIVE' }, ...markedOutbid];
          });
        }

        if (data.antiSnipingExtended) {
          setSnipingAlert(true);
          setTimeout(() => setSnipingAlert(false), 8000);
        }

        const nextMin = data.currentHighestBid + (auction?.minIncrement || 10);
        setBidAmount(String(nextMin));
      }
    };

    const handleStatusChanged = (data) => {
      console.log('[Socket] Status changed:', data);
      if (data.auctionId === id) {
        setAuction((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            status: data.status,
            winnerId: data.winnerId,
            winningBid: data.winningBid,
          };
        });
      }
    };

    socket.on('auction:bid_placed', handleBidPlaced);
    socket.on('auction:status_changed', handleStatusChanged);
    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));

    return () => {
      socket.emit('leave:auction', id);
      socket.off('auction:bid_placed', handleBidPlaced);
      socket.off('auction:status_changed', handleStatusChanged);
    };
  }, [id, auction?.minIncrement]);

  if (loading || !auction) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-bold text-slate-500">Connecting to real-time live bidding terminal...</p>
      </div>
    );
  }

  const isLive = auction.status === 'LIVE';
  const isSettled = auction.status === 'SETTLED';
  const isScheduled = auction.status === 'SCHEDULED';
  const isClosed = auction.status === 'CLOSED';

  const isHighestBidder = user && (auction.highestBidderId?._id || auction.highestBidderId)?.toString() === user.id?.toString();
  const userHasBid = user && bids.some((b) => (b.bidderId?._id || b.bidderId)?.toString() === user.id?.toString());
  const isOutbid = userHasBid && !isHighestBidder && isLive;
  const isWinner = user && isSettled && (auction.winnerId?._id || auction.winnerId)?.toString() === user.id?.toString();
  const isSeller = user && (auction.sellerId?._id || auction.sellerId)?.toString() === user.id?.toString();

  const minNextBid = auction.totalBids === 0
    ? auction.startingPrice
    : auction.currentHighestBid + auction.minIncrement;

  const handlePlaceBid = async (e) => {
    e.preventDefault();
    setBidError('');
    setBidSuccess('');

    if (!user) {
      setBidError('Please log in or select a demo persona from the top bar to bid.');
      return;
    }

    const numAmount = Number(bidAmount);
    if (!numAmount || numAmount < minNextBid) {
      setBidError(`Bid must be at least $${minNextBid.toFixed(2)}`);
      return;
    }

    const isSameBidderRaising = isHighestBidder;
    const requiredHold = isSameBidderRaising ? numAmount - auction.currentHighestBid : numAmount;

    if (wallet.availableBalance < requiredHold) {
      setBidError(`Insufficient available balance ($${wallet.availableBalance.toFixed(2)}). You need $${requiredHold.toFixed(2)} available.`);
      return;
    }

    try {
      setSubmittingBid(true);
      const res = await api.placeBid(auction._id, numAmount);
      if (res.success) {
        setBidSuccess(`Bid of $${numAmount.toFixed(2)} confirmed and hold secured!`);
        fetchWallet();
        setTimeout(() => setBidSuccess(''), 4000);
      }
    } catch (err) {
      setBidError(err.message || 'Failed to place bid');
    } finally {
      setSubmittingBid(false);
    }
  };

  const quickIncrement = (delta) => {
    const nextAmt = (Number(bidAmount) || minNextBid) + delta;
    setBidAmount(String(nextAmt));
  };

  const reserveMet = !auction.reservePrice || auction.currentHighestBid >= auction.reservePrice;

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-4 sm:py-5 space-y-4">
      {/* Back Link & Socket Status Indicator */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-black text-slate-800 hover:text-[#8C6608] transition-colors"
        >
          <ArrowLeft size={15} />
          <span>Back to Marketplace</span>
        </Link>

        <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-[#E8DEBE] shadow-xs text-xs font-black text-[#0F172A]">
          <Radio size={13} className={isConnected ? 'text-emerald-600 animate-pulse' : 'text-slate-400'} />
          <span>{isConnected ? 'Real-Time Sync Active' : 'Reconnecting...'}</span>
        </div>
      </div>

      {/* Dynamic Anti-Sniping Alert */}
      {snipingAlert && (
        <div className="p-3 bg-orange-500 text-white rounded-xl shadow-xs flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2.5">
            <Zap size={20} className="animate-bounce shrink-0" />
            <div>
              <h4 className="font-black text-sm font-heading">Anti-Sniping Extension Triggered!</h4>
              <p className="text-xs opacity-95">
                A last-minute bid was placed. Auction end time has been automatically extended by +2 minutes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Dynamic User Status Banners */}
      {isHighestBidder && isLive && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-950 rounded-xl shadow-xs flex items-center gap-3">
          <div className="p-1.5 bg-emerald-600 text-white rounded-lg">
            <CheckCircle2 size={18} />
          </div>
          <div>
            <h4 className="font-black text-sm">You are the highest bidder! 👑</h4>
            <p className="text-xs text-emerald-800 font-medium">
              Your wallet hold of <strong>${auction.currentHighestBid.toFixed(2)}</strong> is currently active.
            </p>
          </div>
        </div>
      )}

      {isOutbid && (
        <div className="p-3.5 bg-red-50 border border-red-300 text-red-950 rounded-xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 outbid-pulse">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-red-600 text-white rounded-lg shrink-0">
              <AlertCircle size={18} />
            </div>
            <div>
              <h4 className="font-black text-sm">You have been outbid!</h4>
              <p className="text-xs text-red-800">
                New highest bid is <strong>${auction.currentHighestBid.toFixed(2)}</strong>. Your previous hold was immediately released back to your available balance.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              setBidAmount(String(minNextBid));
              document.getElementById('bid-box-input')?.focus();
            }}
            className="btn-primary text-xs py-1.5 px-3.5 rounded-xl font-black shadow-xs shrink-0 self-start sm:self-auto"
          >
            Reclaim Lead
          </button>
        </div>
      )}

      {isWinner && (
        <div className="p-4 bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 border border-[#D4AF37] text-[#0F172A] rounded-xl shadow-xs flex items-center gap-3">
          <div className="p-2 bg-[#D4AF37] text-black rounded-lg font-bold">
            <Gavel size={20} />
          </div>
          <div>
            <h4 className="font-black text-base text-[#8C6608]">🎉 You Won This Auction!</h4>
            <p className="text-xs text-slate-800 font-medium">
              Winning Bid: <strong>${auction.winningBid?.toFixed(2)}</strong>. The funds have been settled to the seller.
            </p>
          </div>
        </div>
      )}

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-start">
        {/* Left: Gallery & Provenance Specs */}
        <div className="lg:col-span-7 space-y-6">
          <div className="card-surface p-3 bg-white border border-slate-200 space-y-3">
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-100">
              <img
                src={auction.images?.[selectedImage] || auction.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}
                alt={auction.title}
                className="w-full h-full object-cover"
              />

              <div className="absolute top-3 left-3">
                {isLive && (
                  <span className="badge badge-live shadow-md">
                    <span className="live-indicator-dot"></span> LIVE AUCTION
                  </span>
                )}
                {isSettled && <span className="badge badge-settled shadow-md">SETTLED 🏆</span>}
                {isScheduled && <span className="badge badge-scheduled shadow-md">UPCOMING ⏳</span>}
                {isClosed && <span className="badge badge-closed shadow-md">CLOSED</span>}
              </div>
            </div>

            {auction.images?.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {auction.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`relative w-20 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${
                      selectedImage === idx ? 'border-[#D4AF37] scale-95 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumb" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description & Specifications Card */}
          <div className="card-surface p-6 bg-white border border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-black bg-amber-50 px-3 py-1 rounded-lg border border-amber-200">
                {auction.category}
              </span>
              <span className="text-xs text-slate-400 font-bold">
                Auction ID: #{auction._id?.slice(-6)}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-black tracking-tight">
              {auction.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
              {auction.description}
            </p>

            <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <img
                  src={auction.sellerId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${auction.sellerId?.name || 'Seller'}`}
                  alt="Seller"
                  className="w-10 h-10 rounded-full border border-slate-200 object-cover"
                />
                <div>
                  <div className="text-[10px] text-slate-400 font-extrabold uppercase">Listed by Seller</div>
                  <div className="text-xs font-extrabold text-black">{auction.sellerId?.name || 'Authorized Seller'}</div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="p-2.5 bg-amber-100 text-[#B8860B] rounded-lg">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-extrabold uppercase">Reserve Price Status</div>
                  <div className="text-xs font-extrabold text-black">
                    {auction.reservePrice > 0 ? (
                      reserveMet ? (
                        <span className="text-emerald-600 font-bold">Reserve Met (${auction.reservePrice})</span>
                      ) : (
                        <span className="text-amber-700 font-bold">Reserve Not Met (${auction.reservePrice})</span>
                      )
                    ) : (
                      <span className="text-slate-600 font-bold">No Reserve Price</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Bidding Terminal & Live Stream */}
        <div className="lg:col-span-5 space-y-6">
          {/* Bidding Terminal Container */}
          <div className="card-surface p-5 sm:p-6 bg-white border border-slate-200 shadow-xl space-y-5">
            {/* Timer Banner */}
            <div className="p-4 bg-black text-white rounded-2xl flex flex-col items-center justify-center text-center space-y-1.5 border border-neutral-800">
              <div className="text-[11px] text-slate-300 uppercase tracking-wider font-extrabold">
                {isLive ? 'Auction Closes In' : isScheduled ? 'Starts In' : 'Auction State'}
              </div>
              <CountdownTimer
                endTime={auction.endTime}
                startTime={auction.startTime}
                status={auction.status}
              />
            </div>

            {/* Current Price Block */}
            <div className="flex items-center justify-between p-4 bg-amber-50/50 rounded-2xl border border-amber-200">
              <div>
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  {auction.totalBids > 0 ? 'Current Highest Bid' : 'Starting Price'}
                </div>
                <div className="text-3xl font-extrabold text-black font-mono mt-0.5">
                  ${(auction.currentHighestBid || auction.startingPrice).toFixed(2)}
                </div>
              </div>

              <div className="text-right">
                <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider">
                  Total Bids
                </div>
                <div className="text-xl font-extrabold text-black mt-0.5 font-mono">
                  {auction.totalBids}
                </div>
              </div>
            </div>

            {/* Bidding Terminal Form */}
            {isLive ? (
              <form onSubmit={handlePlaceBid} className="space-y-4">
                {bidError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <AlertCircle size={16} className="text-red-600 shrink-0" />
                    <span>{bidError}</span>
                  </div>
                )}

                {bidSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
                    <span>{bidSuccess}</span>
                  </div>
                )}

                {/* Quick Increment Buttons */}
                <div>
                  <div className="flex items-center justify-between text-xs font-extrabold text-black mb-1.5">
                    <span>Quick Increment</span>
                    <span className="text-slate-400 font-bold">Min Step: ${auction.minIncrement}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {[auction.minIncrement, 50, 100, 250].map((delta) => (
                      <button
                        type="button"
                        key={delta}
                        onClick={() => quickIncrement(delta)}
                        className="py-2 px-1 bg-slate-50 hover:bg-amber-50 text-black font-extrabold text-xs border border-slate-200 hover:border-[#D4AF37] rounded-xl transition-all"
                      >
                        +${delta}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Bid Input */}
                <div>
                  <label className="block text-xs font-extrabold text-black uppercase tracking-wider mb-1.5">
                    Your Bid Amount ($)
                  </label>
                  <div className="relative">
                    <DollarSign size={20} className="absolute inset-y-0 left-3 my-auto text-slate-400" />
                    <input
                      id="bid-box-input"
                      type="number"
                      min={minNextBid}
                      step="1"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      disabled={isSeller || submittingBid}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-black font-extrabold text-xl font-mono focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white"
                      placeholder={`Min: $${minNextBid.toFixed(2)}`}
                      required
                    />
                  </div>
                </div>

                {/* Available Balance & Gateway Trigger */}
                <div className="space-y-3 pt-1">
                  {user ? (
                    <div className="flex items-center justify-between text-xs text-slate-600 px-1 font-medium">
                      <span>Available: <strong className="text-black font-bold">${wallet.availableBalance.toFixed(2)}</strong></span>
                      <button
                        type="button"
                        onClick={() => setIsGatewayOpen(true)}
                        className="text-[#B8860B] font-extrabold hover:underline flex items-center gap-1"
                      >
                        <CreditCard size={13} />
                        <span>Add Funds</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-800 bg-amber-50 p-2.5 rounded-xl border border-amber-200 font-semibold">
                      Please log in or select a persona from the top banner to place bids.
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSeller || submittingBid || !user}
                    className="w-full btn-primary py-3.5 rounded-2xl font-extrabold text-base shadow-lg shadow-amber-500/25"
                  >
                    {submittingBid
                      ? 'Securing Atomic Hold...'
                      : isSeller
                      ? 'Sellers Cannot Bid on Own Listing'
                      : `Place Bid for $${Number(bidAmount || minNextBid).toFixed(2)}`}
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-6 bg-slate-50 rounded-2xl text-center space-y-1.5 border border-slate-200">
                <div className="text-sm font-extrabold text-black">
                  {isScheduled && 'Auction scheduled to go live soon.'}
                  {isSettled && `Settled! Winning Bid: $${auction.winningBid?.toFixed(2)}`}
                  {isClosed && 'This auction has closed.'}
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {isScheduled
                    ? 'Bidding opens automatically at the configured start time.'
                    : 'Check out active listings in the marketplace.'}
                </p>
              </div>
            )}
          </div>

          {/* Live Bid Stream Feed */}
          <div className="card-surface p-5 bg-white border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp size={16} className="text-[#D4AF37]" />
                <h3 className="font-heading font-extrabold text-sm text-black">Live Bid Stream</h3>
              </div>
              <span className="text-[11px] text-slate-400 font-bold">
                {bids.length} total bids
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {bids.length > 0 ? (
                bids.map((bid, idx) => {
                  const isTop = idx === 0;
                  const isUserBid = user && (bid.bidderId?._id || bid.bidderId)?.toString() === user.id?.toString();
                  const isLeading = isTop && isLive;
                  const isWon = isTop && isSettled;
                  const displayStatus = isWon ? 'WON' : isLeading ? 'ACTIVE' : 'OUTBID';
                  const bidderName = bid.bidderId?.name || (isUserBid ? user?.name : 'Bidder');

                  return (
                    <div
                      key={bid._id || `${idx}-${bid.amount}`}
                      className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-all ${
                        isTop
                          ? 'bg-amber-50/70 border border-[#D4AF37]/50 font-bold shadow-xs flash-bid-row'
                          : 'bg-slate-50/80 border border-slate-200/70 text-slate-600'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-white border border-[#E8DEBE] shrink-0 flex items-center justify-center">
                          <img
                            src={bid.bidderId?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(bidderName)}`}
                            alt=""
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(bidderName)}`;
                            }}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-extrabold text-[#0F172A] flex items-center gap-1.5 truncate">
                            <span className="truncate">{bidderName}</span>
                            {isUserBid && (
                              <span className="px-1.5 py-0.5 bg-[#D4AF37] text-black rounded text-[9px] font-black uppercase shrink-0 shadow-xs">
                                You
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 font-semibold">
                            {new Date(bid.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-2">
                        <div className="font-mono font-black text-sm text-[#0F172A]">
                          ${Number(bid.amount).toFixed(2)}
                        </div>
                        <span
                          className={`inline-block text-[9px] uppercase font-black px-1.5 py-0.5 rounded border ${
                            displayStatus === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : displayStatus === 'WON'
                              ? 'bg-amber-100 text-[#8C6608] border-[#D4AF37]'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {displayStatus}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 font-medium">
                  No bids placed yet. Place the first bid!
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <PaymentGatewayModal isOpen={isGatewayOpen} onClose={() => setIsGatewayOpen(false)} />
    </div>
  );
};
