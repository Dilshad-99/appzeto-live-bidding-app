import React from 'react';
import { ShieldCheck, Lock, Eye, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PrivacyPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-extrabold uppercase">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Security & Provenance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0F172A]">
          Privacy Policy & Item Provenance
        </h1>
        <p className="text-xs text-slate-500">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="card-surface p-6 sm:p-8 bg-white border border-[#E8DEBE] space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
        <section className="space-y-2">
          <h3 className="font-heading font-black text-sm sm:text-base text-[#0F172A] flex items-center gap-2">
            <Lock size={18} className="text-[#D4AF37]" />
            1. Cryptographic Security & Financial Privacy
          </h3>
          <p>
            All user wallet balances, transaction logs, and bid submissions are protected by industry-grade encryption and strict access controls. Only authorized system processes operating within atomic database sessions can access or modify your escrow ledger.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-heading font-black text-sm sm:text-base text-[#0F172A] flex items-center gap-2">
            <Eye size={18} className="text-[#D4AF37]" />
            2. Transparent Bidding Stream & Anonymity
          </h3>
          <p>
            While live bid amounts and timestamps are broadcast to all participants in real time for transparent market discovery, sensitive personal contact details, private payment credentials, and exact total wallet balances are never exposed to public view.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-heading font-black text-sm sm:text-base text-[#0F172A] flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            3. Provenance Verification & Authenticity
          </h3>
          <p>
            Every luxury lot listed on AuctionHub undergoes administrative review prior to being scheduled for live bidding. Sellers must provide complete provenance records, high-resolution photography, and item condition specifications.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-heading font-black text-sm sm:text-base text-[#0F172A] flex items-center gap-2">
            <CheckCircle2 size={18} className="text-[#D4AF37]" />
            4. Immutable Audit Ledger
          </h3>
          <p>
            Every wallet deposit, hold capture, outbid refund, and seller payout is recorded as an immutable Transaction record containing precise before/after balance snapshots and cryptographic timestamps.
          </p>
        </section>
      </div>

      <div className="text-center pt-2">
        <Link to="/faq" className="text-xs font-extrabold text-[#8C6608] hover:underline">
          Return to Help Center & FAQ →
        </Link>
      </div>
    </div>
  );
};
