import React from 'react';
import { Gavel, ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="bg-[#FAF7F0] border-t border-[#E8DEBE] mt-8 sm:mt-10 py-7 sm:py-8 text-xs text-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pb-6 border-b border-[#E8DEBE]">
          {/* Brand & Mission */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#FAF3E0] to-[#F4E5B8] flex items-center justify-center text-[#8C6608] border border-[#D4AF37]/50 shadow-xs">
                <Gavel size={18} />
              </div>
              <span className="font-heading text-lg font-black text-[#0F172A]">
                Auction<span className="text-[#D4AF37]">Hub</span>
              </span>
            </div>
            <p className="text-slate-700 max-w-sm font-medium leading-relaxed">
              Real-Time High-Concurrency Auction & Bidding Engine with Dual-Layer Mutex & ACID Wallet Hold Guarantees.
            </p>
            <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-[11px] pt-1">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>ACID Guaranteed — Zero Double-Spend & Lock Invariant</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2.5">
            <h4 className="text-[#0F172A] font-black text-xs uppercase tracking-wider">Marketplace</h4>
            <ul className="space-y-2 font-bold">
              <li>
                <Link to="/" className="text-slate-700 hover:text-[#8C6608] transition-colors">All Auctions</Link>
              </li>
              <li>
                <Link to="/?tab=LIVE" className="text-slate-700 hover:text-[#8C6608] transition-colors">Live Bidding Rooms</Link>
              </li>
              <li>
                <Link to="/wallet" className="text-slate-700 hover:text-[#8C6608] transition-colors">Wallet & Hold Escrow</Link>
              </li>
              <li>
                <Link to="/create-auction" className="text-slate-700 hover:text-[#8C6608] transition-colors">Sell an Item</Link>
              </li>
            </ul>
          </div>

          {/* About & Support */}
          <div className="space-y-2.5">
            <h4 className="text-[#0F172A] font-black text-xs uppercase tracking-wider">About · Support</h4>
            <ul className="space-y-2 font-bold">
              <li>
                <Link to="/about" className="text-slate-700 hover:text-[#8C6608] transition-colors">About AuctionHub</Link>
              </li>
              <li>
                <Link to="/faq" className="text-slate-700 hover:text-[#8C6608] transition-colors">Help Center & FAQ</Link>
              </li>
              <li>
                <Link to="/terms" className="text-slate-700 hover:text-[#8C6608] transition-colors">Terms & Conditions</Link>
              </li>
              <li>
                <Link to="/privacy" className="text-slate-700 hover:text-[#8C6608] transition-colors">Privacy & Provenance</Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Evaluation Note */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-[11px] text-slate-600 font-bold">
          <div>
            © {new Date().getFullYear()} AuctionHub Inc. Appzeto Machine Test Task 1. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <Link to="/about" className="hover:text-[#8C6608] transition-colors">Security Audited</Link>
            <span>·</span>
            <Link to="/faq" className="hover:text-[#8C6608] transition-colors">Anti-Sniping Engine</Link>
            <span>·</span>
            <Link to="/wallet" className="hover:text-[#8C6608] transition-colors">Instant Hold Refund</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
