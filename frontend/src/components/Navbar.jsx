import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { useWallet } from '../context/WalletContext';
import { PaymentGatewayModal } from './PaymentGatewayModal';
import {
  Gavel,
  Wallet,
  PlusCircle,
  ShieldAlert,
  Flame,
  User,
  LogOut,
  Sparkles,
  Menu,
  X,
  CreditCard,
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, switchDemoUser } = useAuth();
  const { wallet } = useWallet();
  const location = useLocation();
  const [isGatewayOpen, setIsGatewayOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Top Demo Banner for Rapid Testing across Devices — Warm Ivory + Gold */}
      <div className="bg-[#FAF7F0] text-[#1E293B] text-xs py-1.5 border-b border-[#E8DEBE]">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-[#8C6608] font-black">
              <Sparkles size={13} className="text-[#D4AF37]" /> Evaluator Persona Switcher:
            </span>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            {DEMO_USERS.map((demo) => {
              const isCurrent = user?.email === demo.email;
              return (
                <button
                  key={demo.email}
                  onClick={() => switchDemoUser(demo.email)}
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold transition-all flex items-center gap-1 ${
                    isCurrent
                      ? 'bg-[#D4AF37] text-black ring-2 ring-[#B8860B]/40 shadow-xs'
                      : 'bg-white text-slate-800 hover:bg-[#FAF3E0] hover:text-[#8C6608] border border-[#E8DEBE]'
                  }`}
                >
                  <span>{demo.name.split(' ')[0]}</span>
                  <span className="opacity-85 text-[10px]">({demo.role})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Responsive Navbar — Pure White + Gold */}
      <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E8DEBE] shadow-xs">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-16">
            {/* Left: Brand Logo & Desktop Links */}
            <div className="flex items-center gap-6 lg:gap-8">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FAF3E0] to-[#F4E5B8] flex items-center justify-center text-[#8C6608] shadow-sm border border-[#D4AF37]/60 group-hover:scale-105 transition-transform">
                  <Gavel size={22} className="text-[#8C6608]" />
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-heading text-xl font-black text-[#0F172A] tracking-tight">
                    Auction<span className="text-[#D4AF37]">Hub</span>
                  </span>
                  <span className="flex items-center gap-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded text-[10px] font-black">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                    LIVE
                  </span>
                </div>
              </Link>

              {/* Desktop Nav Items */}
              <div className="hidden md:flex items-center gap-1">
                <Link
                  to="/"
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors ${
                    isActive('/') ? 'text-[#8C6608] bg-[#FAF3E0] border border-[#D4AF37]/50 shadow-xs' : 'text-slate-800 hover:text-[#B8860B] hover:bg-[#FAF7F0]'
                  }`}
                >
                  Marketplace
                </Link>

                <Link
                  to="/?tab=LIVE"
                  className="px-3 py-1.5 rounded-lg text-xs font-black text-slate-800 hover:text-[#B8860B] hover:bg-[#FAF7F0] flex items-center gap-1"
                >
                  <Flame size={14} className="text-orange-500" />
                  Live Auctions
                </Link>

                {user && (
                  <Link
                    to="/wallet"
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors ${
                      isActive('/wallet') ? 'text-[#8C6608] bg-[#FAF3E0] border border-[#D4AF37]/50 shadow-xs' : 'text-slate-800 hover:text-[#B8860B] hover:bg-[#FAF7F0]'
                    }`}
                  >
                    Wallet & Bids
                  </Link>
                )}

                {(user?.role === 'SELLER' || user?.role === 'ADMIN') && (
                  <Link
                    to="/create-auction"
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors flex items-center gap-1 ${
                      isActive('/create-auction') ? 'text-[#8C6608] bg-[#FAF3E0] border border-[#D4AF37]/50 shadow-xs' : 'text-slate-800 hover:text-[#B8860B] hover:bg-[#FAF7F0]'
                    }`}
                  >
                    <PlusCircle size={14} />
                    Create Listing
                  </Link>
                )}

                <Link
                  to="/faq"
                  className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors ${
                    isActive('/faq') ? 'text-[#8C6608] bg-[#FAF3E0] border border-[#D4AF37]/50 shadow-xs' : 'text-slate-800 hover:text-[#B8860B] hover:bg-[#FAF7F0]'
                  }`}
                >
                  Help & FAQ
                </Link>

                {user?.role === 'ADMIN' && (
                  <Link
                    to="/admin"
                    className={`px-3 py-1.5 rounded-lg text-xs font-black transition-colors flex items-center gap-1 ${
                      isActive('/admin') ? 'text-[#8C6608] bg-[#FAF3E0] border border-[#D4AF37]/50 shadow-xs' : 'text-slate-800 hover:text-[#B8860B] hover:bg-[#FAF7F0]'
                    }`}
                  >
                    <ShieldAlert size={14} className="text-[#D4AF37]" />
                    Admin Panel
                  </Link>
                )}
              </div>
            </div>

            {/* Right: Wallet, Payment Gateway Trigger, Profile & Mobile Hamburger */}
            <div className="flex items-center gap-2 sm:gap-3">
              {user ? (
                <>
                  {/* Live Wallet Balance & Payment Trigger */}
                  <div className="flex items-center bg-[#FAF7F0] rounded-xl p-1 border border-[#E8DEBE]">
                    <Link
                      to="/wallet"
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-900 hover:text-[#B8860B]"
                    >
                      <Wallet size={14} className="text-[#D4AF37]" />
                      <span className="font-black text-[#0F172A] font-mono">${wallet.availableBalance.toFixed(0)}</span>
                      {wallet.heldBalance > 0 && (
                        <span className="hidden sm:inline text-[10px] text-[#8C6608] font-black ml-1">
                          (${wallet.heldBalance.toFixed(0)} held)
                        </span>
                      )}
                    </Link>

                    {/* Pay & Deposit Button */}
                    <button
                      onClick={() => setIsGatewayOpen(true)}
                      className="btn-primary text-[11px] py-1 px-2.5 rounded-lg shadow-xs font-black flex items-center gap-1"
                      title="Open Payment Gateway"
                    >
                      <CreditCard size={12} />
                      <span className="hidden sm:inline">+ Add Funds</span>
                      <span className="sm:hidden">+ Pay</span>
                    </button>
                  </div>

                  {/* Profile Avatar */}
                  <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-[#E8DEBE]">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-8 h-8 rounded-full border border-[#D4AF37]/50 object-cover bg-[#FAF3E0]"
                    />
                    <div className="text-left">
                      <div className="text-xs font-black text-[#0F172A] leading-tight">{user.name}</div>
                      <div className="text-[10px] font-extrabold text-[#8C6608] leading-none">{user.role}</div>
                    </div>
                    <button
                      onClick={logout}
                      className="p-1.5 text-slate-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                      title="Logout"
                    >
                      <LogOut size={15} />
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Link
                    to="/login"
                    className="px-3 py-1.5 text-xs font-black text-slate-800 hover:text-black hover:bg-[#FAF7F0] rounded-lg transition-colors"
                  >
                    Log In
                  </Link>
                  <Link
                    to="/register"
                    className="btn-primary text-xs py-1.5 px-3 rounded-lg font-black"
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 text-slate-800 hover:text-black hover:bg-[#FAF7F0] rounded-lg"
              >
                {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-[#E8DEBE] px-4 py-3 space-y-2 animate-fade-in text-xs font-black">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-slate-800 hover:text-[#B8860B] border-b border-[#FAF3E0]"
            >
              Marketplace
            </Link>
            <Link
              to="/?tab=LIVE"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-slate-800 hover:text-[#B8860B] border-b border-[#FAF3E0] flex items-center gap-1.5"
            >
              <Flame size={14} className="text-orange-500" />
              Live Auctions
            </Link>
            {user && (
              <Link
                to="/wallet"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-slate-800 hover:text-[#B8860B] border-b border-[#FAF3E0]"
              >
                Wallet & My Bids
              </Link>
            )}
            {(user?.role === 'SELLER' || user?.role === 'ADMIN') && (
              <Link
                to="/create-auction"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-slate-800 hover:text-[#B8860B] border-b border-[#FAF3E0]"
              >
                Create Listing
              </Link>
            )}
            {user?.role === 'ADMIN' && (
              <Link
                to="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-2 text-slate-800 hover:text-[#B8860B] border-b border-[#FAF3E0]"
              >
                Admin Panel
              </Link>
            )}
            <Link
              to="/faq"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block py-2 text-slate-800 hover:text-[#B8860B] border-b border-[#FAF3E0]"
            >
              Help & FAQ
            </Link>
            {user && (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left py-2 text-red-600 font-black flex items-center gap-1.5"
              >
                <LogOut size={14} />
                <span>Log Out</span>
              </button>
            )}
          </div>
        )}
      </nav>

      {/* Payment Gateway Modal */}
      <PaymentGatewayModal isOpen={isGatewayOpen} onClose={() => setIsGatewayOpen(false)} />
    </>
  );
};
