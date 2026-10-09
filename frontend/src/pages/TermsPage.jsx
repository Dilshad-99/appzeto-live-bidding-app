import React from 'react';
import { FileText, Shield, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const TermsPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-[#E8DEBE] text-[#8C6608] text-xs font-extrabold uppercase">
          <FileText size={14} className="text-[#D4AF37]" />
          <span>Platform Policy</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0F172A]">
          Terms & Conditions of Auction Participation
        </h1>
        <p className="text-xs text-slate-500">
          Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </p>
      </div>

      <div className="card-surface p-6 sm:p-8 bg-white border border-[#E8DEBE] space-y-6 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
        <section className="space-y-2">
          <h3 className="font-heading font-black text-sm sm:text-base text-[#0F172A] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-[#8C6608] flex items-center justify-center text-xs font-black">1</span>
            Binding Nature of Bids & Atomic Wallet Holds
          </h3>
          <p>
            Every bid submitted through the AuctionHub platform constitutes a legally binding commitment to purchase the listed item at the submitted price. By submitting a bid, you authorize AuctionHub to atomically hold the requisite funds from your available wallet balance in our secure escrow smart ledger.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-heading font-black text-sm sm:text-base text-[#0F172A] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-[#8C6608] flex items-center justify-center text-xs font-black">2</span>
            Outbid Protections & Instant Escrow Release
          </h3>
          <p>
            If your bid is superseded by a higher valid bid from another participant, our ACID transaction engine immediately releases 100% of your held balance back to your available balance. No withdrawal penalties, cancellation fees, or delays apply to outbid balances.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-heading font-black text-sm sm:text-base text-[#0F172A] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-[#8C6608] flex items-center justify-center text-xs font-black">3</span>
            Anti-Sniping (Snipe Guard) Rules
          </h3>
          <p>
            To prevent unfair advantage through automated software bots, any bid submitted within the final two (2) minutes of an auction will automatically extend the auction clock by an additional two (2) minutes. This process repeats dynamically until bidding ceases.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-heading font-black text-sm sm:text-base text-[#0F172A] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-[#8C6608] flex items-center justify-center text-xs font-black">4</span>
            Prohibition of Shill Bidding & Seller Self-Bidding
          </h3>
          <p>
            Sellers are strictly prohibited from placing bids on items they have listed for sale, whether directly or through proxy accounts. Any attempt to artificially inflate auction prices triggers an automated rejection and account review.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-heading font-black text-sm sm:text-base text-[#0F172A] flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-amber-100 text-[#8C6608] flex items-center justify-center text-xs font-black">5</span>
            Reserve Price Policy & Settlement
          </h3>
          <p>
            If an auction ends without reaching the seller’s confidential reserve price, the auction will automatically close with no winner declared. All held balances belonging to bidders are refunded in full without deduction.
          </p>
        </section>
      </div>

      <div className="text-center pt-2">
        <Link to="/faq" className="text-xs font-extrabold text-[#8C6608] hover:underline">
          Have more questions? Visit our Help Center & FAQ →
        </Link>
      </div>
    </div>
  );
};
