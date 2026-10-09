import React from 'react';
import { Link } from 'react-router-dom';
import { CountdownTimer } from './CountdownTimer';
import { Gavel, ArrowUpRight } from 'lucide-react';

export const AuctionCard = ({ auction }) => {
  const isLive = auction.status === 'LIVE';
  const isScheduled = auction.status === 'SCHEDULED';
  const isSettled = auction.status === 'SETTLED';
  const isDraft = auction.status === 'DRAFT';

  const displayPrice = auction.currentHighestBid > 0 ? auction.currentHighestBid : auction.startingPrice;
  const isCurrentBid = auction.currentHighestBid > 0;

  return (
    <div className="card-surface overflow-hidden flex flex-col card-interactive group bg-white border border-[#E8DEBE] shadow-xs hover:border-[#D4AF37]">
      {/* Thumbnail & Badges */}
      <div className="relative aspect-[4/3] bg-[#FAF7F0] overflow-hidden">
        <img
          src={auction.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80'}
          alt={auction.title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <span className="bg-white/95 backdrop-blur-md text-[#8C6608] text-[10px] sm:text-[11px] font-black px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg shadow-xs border border-[#D4AF37]/40">
            {auction.category}
          </span>

          {isLive && (
            <span className="badge badge-live shadow-xs flex items-center gap-1.5 font-black">
              <span className="live-indicator-dot"></span>
              LIVE
            </span>
          )}

          {isScheduled && (
            <span className="badge badge-scheduled shadow-xs font-black">
              Upcoming
            </span>
          )}

          {isSettled && (
            <span className="badge badge-settled shadow-xs font-black">
              Settled 🏆
            </span>
          )}

          {isDraft && (
            <span className="badge badge-draft shadow-xs font-black">
              Draft
            </span>
          )}
        </div>

        {/* Bottom Timer Banner — White/Gold Frosted */}
        <div className="absolute bottom-2 left-2 right-2 bg-white/95 backdrop-blur-md rounded-xl p-1.5 px-2.5 sm:p-2 sm:px-3 flex items-center justify-between text-[#0F172A] border border-[#E8DEBE] shadow-xs text-xs">
          <CountdownTimer
            endTime={auction.endTime}
            startTime={auction.startTime}
            status={auction.status}
            compact={true}
          />
          <span className="text-[10px] sm:text-[11px] text-[#8C6608] font-black">
            {auction.totalBids} {auction.totalBids === 1 ? 'bid' : 'bids'}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <Link to={`/auctions/${auction._id}`}>
            <h3 className="font-heading font-black text-sm sm:text-base text-[#0F172A] line-clamp-1 group-hover:text-[#B8860B] transition-colors">
              {auction.title}
            </h3>
          </Link>
          <p className="text-[11px] sm:text-xs text-slate-800 font-medium mt-1 line-clamp-2 leading-relaxed">
            {auction.description}
          </p>
        </div>

        {/* Pricing & Gold Action Button */}
        <div className="pt-2.5 border-t border-[#E8DEBE] flex items-center justify-between">
          <div>
            <div className="text-[10px] font-black text-[#8C6608] uppercase tracking-wider">
              {isCurrentBid ? 'Highest Bid' : 'Starting Price'}
            </div>
            <div className="text-base sm:text-lg font-black text-[#0F172A] font-mono">
              ${displayPrice.toFixed(2)}
            </div>
          </div>

          <Link
            to={`/auctions/${auction._id}`}
            className="btn-primary text-[11px] sm:text-xs py-1.5 px-3 sm:py-2 sm:px-3.5 rounded-xl flex items-center gap-1 font-black shadow-xs"
          >
            <span>{isLive ? 'Place Bid' : 'View'}</span>
            <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
};
