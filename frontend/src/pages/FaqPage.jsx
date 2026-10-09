import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ShieldCheck, Zap, Wallet, Lock, ArrowRight, Gavel, Search } from 'lucide-react';
import { Link } from 'react-router-dom';

const FAQ_DATA = [
  {
    category: 'Bidding & Auctions',
    questions: [
      {
        q: 'How does real-time live bidding work on AuctionHub?',
        a: 'Our platform uses high-performance WebSockets (Socket.IO) to push bid increments, outbid notices, and countdown updates to all participants instantly with sub-50ms latency. No manual page refreshes are ever required.'
      },
      {
        q: 'What is the Anti-Sniping (Snipe Guard) protection?',
        a: 'To guarantee fairness and prevent automated bot sniping in the closing seconds, any valid bid placed within the final 2 minutes automatically extends the auction countdown timer by +2 minutes. This ensures all legitimate bidders have adequate time to respond.'
      },
      {
        q: 'Can a seller bid on their own listed items?',
        a: 'No. Shilling and self-bidding are strictly blocked at both the API controller and database mutex layer. Sellers cannot place bids on any auction listings associated with their seller account ID.'
      },
      {
        q: 'What happens if the auction reserve price is not met?',
        a: 'If an auction closes with a highest bid below the seller’s configured reserve price, the auction transitions to CLOSED without a winner, and the top bidder’s held escrow funds are immediately and automatically released back to their available balance.'
      }
    ]
  },
  {
    category: 'Wallet & ACID Escrow Holds',
    questions: [
      {
        q: 'How does the Wallet Hold & Escrow system protect my money?',
        a: 'When you place a bid, the exact bid amount is transferred from your "Available Balance" to your "Held Escrow Balance" inside a strict MongoDB ACID session transaction. Your funds remain secured in escrow until you are either outbid or win the auction.'
      },
      {
        q: 'What happens when someone outbids me?',
        a: 'The moment a higher valid bid is processed, our concurrency engine instantly releases 100% of your previously held funds back to your Available Balance in the same atomic transaction. You also receive an instant outbid alert.'
      },
      {
        q: 'How does Seller Payout & Settlement execute?',
        a: 'When a live auction reaches its end time with reserve met, our automated background scheduler settles the auction: the winning bidder’s held escrow funds are captured and credited directly into the Seller’s available wallet balance.'
      },
      {
        q: 'How do I add funds using the Payment Gateway simulation?',
        a: 'Click the "Add Funds" button in the Navbar or Wallet page to open the interactive simulated Payment Gateway modal. You can choose from instant preset amounts ($500 to $10,000) or enter custom amounts via mock Credit Card, UPI, or Net Banking.'
      }
    ]
  },
  {
    category: 'Security & Technical Architecture',
    questions: [
      {
        q: 'How are concurrent simultaneous bids handled without double-spending?',
        a: 'We implement a dual-layer concurrency protection model: an in-memory per-auction mutex lock coupled with MongoDB replica set multi-document ACID transactions. Even if 100 bidders submit identical bids at the exact same millisecond, exactly one succeeds and all others are safely rejected with accurate status.'
      },
      {
        q: 'What roles and permissions are supported?',
        a: 'AuctionHub supports 3 distinct roles: BIDDER (can fund wallet, place bids, manage escrow), SELLER (can list auctions in DRAFT, manage listings, receive payouts), and ADMIN (can review drafts, approve/reject listings, and monitor platform metrics).'
      }
    ]
  }
];

export const FaqPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openItems, setOpenItems] = useState({});

  const toggleItem = (categoryIdx, questionIdx) => {
    const key = `${categoryIdx}-${questionIdx}`;
    setOpenItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const filteredCategories = FAQ_DATA.map((cat) => {
    const filteredQuestions = cat.questions.filter(
      (item) =>
        item.q.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.a.toLowerCase().includes(searchTerm.toLowerCase())
    );
    return { ...cat, questions: filteredQuestions };
  }).filter((cat) => cat.questions.length > 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-[#E8DEBE] text-[#8C6608] text-xs font-extrabold uppercase tracking-wider">
          <HelpCircle size={15} className="text-[#D4AF37]" />
          <span>AuctionHub Help Center</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-[#0F172A] tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
          Everything you need to know about real-time bidding, ACID wallet hold guarantees, anti-sniping protection, and seller settlement.
        </p>

        {/* Search Bar */}
        <div className="max-w-lg mx-auto relative pt-3">
          <Search size={18} className="absolute left-4 top-1/2 mt-1.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions (e.g., outbid, escrow, anti-sniping)..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#E8DEBE] rounded-2xl text-xs sm:text-sm font-bold text-[#0F172A] placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#D4AF37] shadow-xs"
          />
        </div>
      </div>

      {/* Feature Highlights Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#E8DEBE] shadow-xs flex items-start gap-3">
          <div className="p-2.5 bg-amber-50 text-[#8C6608] border border-amber-200 rounded-xl shrink-0">
            <Zap size={20} className="text-[#D4AF37]" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-[#0F172A]">Real-Time Sync</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">WebSocket live room broadcast with instant outbid alerts.</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E8DEBE] shadow-xs flex items-start gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl shrink-0">
            <ShieldCheck size={20} className="text-emerald-600" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-[#0F172A]">ACID Guaranteed</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Atomic wallet holds with zero double-spend risks.</p>
          </div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-[#E8DEBE] shadow-xs flex items-start gap-3">
          <div className="p-2.5 bg-amber-50 text-[#8C6608] border border-amber-200 rounded-xl shrink-0">
            <Wallet size={20} className="text-[#D4AF37]" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold text-[#0F172A]">Instant Outbid Release</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">Held balance is refunded immediately when outbid.</p>
          </div>
        </div>
      </div>

      {/* FAQ Accordion Sections */}
      <div className="space-y-6">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((cat, catIdx) => (
            <div key={catIdx} className="card-surface p-5 sm:p-6 bg-white border border-[#E8DEBE] space-y-3">
              <h2 className="text-sm sm:text-base font-extrabold font-heading text-[#0F172A] border-b border-slate-100 pb-2">
                {cat.category}
              </h2>

              <div className="space-y-2.5">
                {cat.questions.map((item, qIdx) => {
                  const isOpen = openItems[`${catIdx}-${qIdx}`];
                  return (
                    <div
                      key={qIdx}
                      className="border border-[#E8DEBE]/70 rounded-xl overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => toggleItem(catIdx, qIdx)}
                        className="w-full p-3.5 text-left bg-white hover:bg-amber-50/50 flex items-center justify-between gap-3 transition-colors"
                      >
                        <span className="font-extrabold text-xs sm:text-sm text-[#0F172A]">
                          {item.q}
                        </span>
                        <ChevronDown
                          size={16}
                          className={`text-slate-400 transition-transform duration-200 shrink-0 ${
                            isOpen ? 'rotate-180 text-[#D4AF37]' : ''
                          }`}
                        />
                      </button>

                      {isOpen && (
                        <div className="p-3.5 pt-2 bg-amber-50/30 text-xs text-slate-700 leading-relaxed border-t border-[#E8DEBE]/60 font-medium">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-[#E8DEBE] space-y-2">
            <p className="text-xs text-slate-500 font-bold">No questions found matching "{searchTerm}".</p>
            <button
              onClick={() => setSearchTerm('')}
              className="btn-outline text-xs py-1.5 px-4 rounded-xl"
            >
              Clear Search
            </button>
          </div>
        )}
      </div>

      {/* CTA Box */}
      <div className="p-6 bg-gradient-to-r from-amber-50 via-amber-100/50 to-amber-50 border border-[#D4AF37]/50 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-heading font-black text-sm text-[#0F172A]">Ready to place your first bid?</h3>
          <p className="text-xs text-slate-600 font-medium">Explore active luxury auctions in the marketplace.</p>
        </div>
        <Link
          to="/"
          className="btn-primary text-xs py-2.5 px-5 rounded-xl font-black inline-flex items-center gap-1.5 shadow-xs shrink-0 self-start sm:self-auto"
        >
          <span>Explore Marketplace</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
