import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { AuctionCard } from '../components/AuctionCard';
import { CountdownTimer } from '../components/CountdownTimer';
import { useSocket } from '../context/SocketContext';
import {
  Search,
  Flame,
  Clock,
  Trophy,
  Filter,
  ArrowRight,
  ShieldCheck,
  Zap,
  Tag,
} from 'lucide-react';

const CATEGORIES = ['All', 'Vehicles', 'Watches', 'Art & Collectibles', 'Jewelry', 'Electronics'];

export const Marketplace = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusTab, setStatusTab] = useState(searchParams.get('tab') || 'ALL');
  const [sortBy, setSortBy] = useState('createdAt');
  const { activeAuctionUpdates } = useSocket();

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedCategory !== 'All') params.category = selectedCategory;
      if (statusTab !== 'ALL') params.status = statusTab;
      if (search) params.search = search;
      if (sortBy) params.sortBy = sortBy;

      const res = await api.getAuctions(params);
      if (res.success) {
        setAuctions(res.data);
      }
    } catch (err) {
      console.error('[Marketplace Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [selectedCategory, statusTab, sortBy]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchAuctions();
  };

  const featuredAuction = auctions.find((a) => a.status === 'LIVE') || auctions[0];

  return (
    <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-4 sm:py-5 space-y-4 sm:space-y-5">
      {/* Split Hero Banner (Option C: Warm Light Luxury Background with Edge-to-Edge Media) */}
      {featuredAuction && statusTab === 'ALL' && (
        <div className="relative overflow-hidden rounded-2xl bg-white border border-[#E8DEBE] shadow-xs">
          {/* Subtle warm ambient background gradient */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#FAF3E0] via-white to-transparent opacity-60 pointer-events-none rounded-full blur-2xl"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 items-stretch">
            {/* Left Column: Clear Hierarchy & Luxury Typography */}
            <div className="lg:col-span-6 p-4 sm:p-6 lg:p-7 flex flex-col justify-between space-y-3.5">
              <div className="space-y-2.5">
                {/* Status & Category Pills */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="badge badge-live flex items-center gap-1.5 shadow-xs font-black">
                    <span className="live-indicator-dot"></span>
                    FEATURED LIVE AUCTION
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-[#FAF3E0] text-[#8C6608] border border-[#D4AF37]/30 rounded-full text-[11px] font-black uppercase tracking-wider">
                    <Tag size={11} />
                    {featuredAuction.category}
                  </span>
                </div>

                {/* Make & Model Title - Crisp Black */}
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-black font-heading text-[#000000] tracking-tight leading-tight">
                  {featuredAuction.title}
                </h1>

                {/* Secondary Description */}
                <p className="text-xs sm:text-sm text-slate-900 font-medium leading-relaxed line-clamp-2">
                  {featuredAuction.description}
                </p>
              </div>

              {/* Price & Countdown Metric Cards (Clean White Card Surfaces with Crisp Borders) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
                {/* Current Highest Bid Card */}
                <div className="bg-[#FAF8F5] rounded-xl p-3 sm:p-3.5 border border-[#D5CDBC] shadow-xs">
                  <div className="text-[10px] sm:text-[11px] text-[#8C6608] uppercase font-black tracking-wider">
                    {featuredAuction.currentHighestBid > 0 ? 'Current Highest Bid' : 'Starting Price'}
                  </div>
                  <div className="text-xl sm:text-2xl font-black text-[#000000] font-mono mt-0.5">
                    ${(featuredAuction.currentHighestBid || featuredAuction.startingPrice).toFixed(2)}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-emerald-800 font-extrabold mt-0.5">
                    {featuredAuction.totalBids} active bids placed
                  </div>
                </div>

                {/* Time Remaining Card */}
                <div className="bg-[#FAF8F5] rounded-xl p-3 sm:p-3.5 border border-[#D5CDBC] shadow-xs">
                  <div className="text-[10px] sm:text-[11px] text-[#8C6608] uppercase font-black tracking-wider mb-1">
                    Bidding Closes In
                  </div>
                  <CountdownTimer
                    endTime={featuredAuction.endTime}
                    startTime={featuredAuction.startTime}
                    status={featuredAuction.status}
                  />
                </div>
              </div>

              {/* Actions & Provenance */}
              <div className="pt-1 flex flex-wrap items-center gap-3">
                <Link
                  to={`/auctions/${featuredAuction._id}`}
                  className="btn-primary py-2.5 px-5 rounded-xl text-xs sm:text-sm font-black shadow-xs flex items-center gap-2"
                >
                  <Zap size={15} />
                  <span>Enter Live Bidding Room</span>
                  <ArrowRight size={15} />
                </Link>

                <div className="text-xs text-slate-900 font-extrabold flex items-center gap-1.5">
                  <ShieldCheck size={15} className="text-[#B8860B]" />
                  <span>Verified Provenance & Certificate</span>
                </div>
              </div>
            </div>

            {/* Right Column: Large High-Impact Image */}
            <div className="lg:col-span-6 relative aspect-[16/11] lg:aspect-auto overflow-hidden bg-slate-100 rounded-b-3xl lg:rounded-b-none lg:rounded-r-3xl">
              <img
                src={featuredAuction.images?.[0] || 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=1200&auto=format&fit=crop&q=85'}
                alt={featuredAuction.title}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=1200&auto=format&fit=crop&q=85';
                }}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none"></div>
            </div>
          </div>
        </div>
      )}

      {/* Filter and Search Bar — Pure White + Gold */}
      <div className="card-surface p-4 sm:p-6 bg-white space-y-4 border border-[#E8DEBE] shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 sm:gap-4">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#FAF7F0] border border-[#E8DEBE] rounded-xl overflow-x-auto">
            <button
              onClick={() => {
                setStatusTab('ALL');
                setSearchParams({});
              }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-black whitespace-nowrap transition-all ${
                statusTab === 'ALL'
                  ? 'bg-white text-[#8C6608] border border-[#D4AF37]/60 shadow-xs'
                  : 'text-slate-800 hover:text-[#8C6608] hover:bg-white/60'
              }`}
            >
              All Items ({auctions.length})
            </button>

            <button
              onClick={() => {
                setStatusTab('LIVE');
                setSearchParams({ tab: 'LIVE' });
              }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition-all ${
                statusTab === 'LIVE'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-800 hover:text-[#8C6608] hover:bg-white/60'
              }`}
            >
              <Flame size={14} className={statusTab === 'LIVE' ? 'text-white' : 'text-orange-500'} />
              Live Auctions
            </button>

            <button
              onClick={() => {
                setStatusTab('SCHEDULED');
                setSearchParams({ tab: 'SCHEDULED' });
              }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition-all ${
                statusTab === 'SCHEDULED'
                  ? 'bg-white text-[#8C6608] border border-[#D4AF37]/60 shadow-xs'
                  : 'text-slate-800 hover:text-[#8C6608] hover:bg-white/60'
              }`}
            >
              <Clock size={14} className="text-[#D4AF37]" />
              Upcoming
            </button>

            <button
              onClick={() => {
                setStatusTab('SETTLED');
                setSearchParams({ tab: 'SETTLED' });
              }}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-black whitespace-nowrap flex items-center gap-1.5 transition-all ${
                statusTab === 'SETTLED'
                  ? 'bg-[#D4AF37] text-black shadow-xs font-black'
                  : 'text-slate-800 hover:text-[#8C6608] hover:bg-white/60'
              }`}
            >
              <Trophy size={14} />
              Settled 🏆
            </button>
          </div>

          {/* Search Input */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 flex-1 md:max-w-xs">
            <div className="relative w-full">
              <Search size={15} className="absolute inset-y-0 left-3 my-auto text-[#B8860B]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search luxury auctions..."
                className="w-full pl-9 pr-4 py-2 text-xs text-[#0F172A] font-bold placeholder:text-slate-500 bg-[#FAF7F0] border border-[#E8DEBE] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white"
              />
            </div>
            <button type="submit" className="btn-primary py-2 px-3 text-xs rounded-xl font-black text-black">
              Search
            </button>
          </form>
        </div>

        {/* Category Pills & Sorting Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#E8DEBE]">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-black text-[#8C6608] uppercase mr-1 flex items-center gap-1">
              <Filter size={12} /> Category:
            </span>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs transition-all ${
                  selectedCategory === cat
                    ? 'bg-[#D4AF37] text-black shadow-xs font-black ring-2 ring-[#B8860B]/30'
                    : 'bg-white text-slate-800 font-bold hover:bg-[#FAF7F0] hover:text-[#8C6608] border border-[#E8DEBE]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-[#8C6608] font-black">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-[#E8DEBE] rounded-lg px-2.5 py-1 text-[#0F172A] font-black focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
            >
              <option value="createdAt">Newest Listed</option>
              <option value="currentHighestBid">Highest Price</option>
              <option value="startingPrice">Lowest Price</option>
              <option value="endTime">Ending Soonest</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Auction Listings */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="card-surface h-72 animate-pulse bg-slate-100 rounded-xl"></div>
          ))}
        </div>
      ) : auctions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
          {auctions.map((auction) => (
            <AuctionCard key={auction._id} auction={auction} />
          ))}
        </div>
      ) : (
        <div className="card-surface p-12 text-center bg-white space-y-3 border border-[#E3E6EB]">
          <div className="w-12 h-12 bg-amber-50 text-[#D4AF37] rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
            <Search size={24} />
          </div>
          <h3 className="text-lg font-extrabold font-heading text-[#191919]">No auctions found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or category filters.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('All');
              setStatusTab('ALL');
              setSearch('');
            }}
            className="btn-secondary text-xs py-2 px-4 rounded-xl font-bold"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};
