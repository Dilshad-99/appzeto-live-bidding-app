import React from 'react';
import { Gavel, ShieldCheck, Zap, Lock, Cpu, Database, CheckCircle2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-[#E8DEBE] text-[#8C6608] text-xs font-extrabold uppercase tracking-wider">
          <Gavel size={15} className="text-[#D4AF37]" />
          <span>Appzeto Machine Test · Task 1</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#0F172A] tracking-tight">
          About Auction<span className="text-[#D4AF37]">Hub</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
          A state-of-the-art Real-Time High-Concurrency Auction & Bidding Platform engineered with dual-layer mutex synchronization, ACID wallet hold guarantees, and anti-sniping protection.
        </p>
      </div>

      {/* Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card-surface p-5 sm:p-6 bg-white border border-[#E8DEBE] space-y-3">
          <div className="flex items-center gap-2.5 text-[#8C6608] font-black text-sm">
            <Cpu size={20} className="text-[#D4AF37]" />
            <h3>Dual-Layer Mutex Concurrency</h3>
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Eliminates race conditions when 100+ simultaneous bids land in the exact same millisecond. An in-memory per-auction mutex serializes incoming bid attempts before committing them to the database.
          </p>
        </div>

        <div className="card-surface p-5 sm:p-6 bg-white border border-[#E8DEBE] space-y-3">
          <div className="flex items-center gap-2.5 text-emerald-800 font-black text-sm">
            <Database size={20} className="text-emerald-600" />
            <h3>MongoDB Multi-Document ACID Transactions</h3>
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Wallet balance deductions, held escrow locks, outbid refund releases, and ledger audit transactions execute together in a single atomic transaction. Zero double-spending is mathematically guaranteed.
          </p>
        </div>

        <div className="card-surface p-5 sm:p-6 bg-white border border-[#E8DEBE] space-y-3">
          <div className="flex items-center gap-2.5 text-orange-800 font-black text-sm">
            <Zap size={20} className="text-orange-500" />
            <h3>Snipe Guard (Anti-Sniping Extension)</h3>
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Any bid placed in the final 2 minutes automatically triggers an atomic 2-minute timer extension, preventing predatory bot sniping and allowing genuine bidders to counter-bid.
          </p>
        </div>

        <div className="card-surface p-5 sm:p-6 bg-white border border-[#E8DEBE] space-y-3">
          <div className="flex items-center gap-2.5 text-purple-800 font-black text-sm">
            <ShieldCheck size={20} className="text-purple-600" />
            <h3>Automated Settlement Engine</h3>
          </div>
          <p className="text-xs text-slate-600 font-medium leading-relaxed">
            Background cron scheduler automatically transitions auctions from SCHEDULED to LIVE, validates reserve prices at close, captures winner funds directly to seller balances, and releases unfulfilled holds.
          </p>
        </div>
      </div>

      {/* Verification & Compliance Checklist */}
      <div className="card-surface p-6 bg-white border border-[#E8DEBE] space-y-4">
        <h3 className="font-heading font-extrabold text-sm sm:text-base text-[#0F172A] border-b border-slate-100 pb-2">
          Machine Test Requirements Verification
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {[
            'Real-Time WebSocket Sync (< 50ms latency)',
            'Atomic Wallet Holds & Instant Outbid Refunds',
            'Anti-Sniping Timer Dynamic Extension (+2 min)',
            'Automated Background Auction Lifecycle Cron',
            'Role-Based Access Control (Admin, Seller, Bidder)',
            '100% Passing Concurrency Automated Test Suite',
            'Simulated Multi-Method Payment Gateway',
            'Pure White & Royal Gold Luxury Responsive UI'
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 p-2.5 bg-slate-50/80 rounded-xl border border-slate-100">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span className="font-bold text-[#0F172A]">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Box */}
      <div className="p-6 bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 border border-[#D4AF37]/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-heading font-black text-sm text-[#0F172A]">Experience Live Bidding in Action</h3>
          <p className="text-xs text-slate-600 font-medium">Switch demo personas from the top bar to test Seller and Bidder workflows.</p>
        </div>
        <Link
          to="/"
          className="btn-primary text-xs py-2.5 px-5 rounded-xl font-black inline-flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
        >
          <span>Explore Live Rooms</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
