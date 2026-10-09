import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Package,
  Check,
  Trash2,
  ExternalLink,
  AlertCircle,
  Sparkles,
  Plus,
} from 'lucide-react';

const CATEGORIES = ['Watches', 'Vehicles', 'Art & Collectibles', 'Jewelry', 'Electronics'];

const CATEGORY_PRESETS = {
  Watches: [
    {
      title: 'Patek Philippe Nautilus 5711/1R Rose Gold',
      url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000&auto=format&fit=crop&q=85',
      label: 'Rose Gold Nautilus',
    },
    {
      title: 'Rolex Daytona "Panda" Chronograph Steel',
      url: 'https://images.unsplash.com/photo-1547996160-71dfa63582d8?w=1000&auto=format&fit=crop&q=85',
      label: 'Rolex Daytona',
    },
    {
      title: 'Audemars Piguet Royal Oak Offshore Chrono',
      url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=1000&auto=format&fit=crop&q=85',
      label: 'AP Royal Oak',
    },
    {
      title: 'Omega Speedmaster Professional Moonwatch',
      url: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1000&auto=format&fit=crop&q=85',
      label: 'Omega Moonwatch',
    },
  ],
  Vehicles: [
    {
      title: '2023 Porsche 911 GT3 RS Clubsport Spec',
      url: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=1000&auto=format&fit=crop&q=85',
      label: 'Porsche 911 GT3',
    },
    {
      title: '1967 Shelby GT500 "Eleanor" Fastback',
      url: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=1000&auto=format&fit=crop&q=85',
      label: 'Shelby GT500',
    },
    {
      title: 'Ferrari 488 Pista Carbon Aerokit',
      url: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=1000&auto=format&fit=crop&q=85',
      label: 'Ferrari 488 Pista',
    },
    {
      title: 'Aston Martin Vantage V8 Coupe Silver',
      url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&auto=format&fit=crop&q=85',
      label: 'Aston Martin',
    },
  ],
  'Art & Collectibles': [
    {
      title: '17th Century Renaissance Oil on Canvas Masterpiece',
      url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=85',
      label: 'Renaissance Canvas',
    },
    {
      title: 'Edo Period Hand-Forged Katana with Dragon Tsuba',
      url: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=1000&auto=format&fit=crop&q=85',
      label: 'Ancient Katana',
    },
    {
      title: 'Roman Empire Caesar Aureus Gold Coin 44 BC',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=85',
      label: 'Gold Aureus Coin',
    },
  ],
  Jewelry: [
    {
      title: '5.20 Carat Emerald-Cut Ceylon Sapphire Platinum Ring',
      url: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1000&auto=format&fit=crop&q=85',
      label: 'Ceylon Sapphire',
    },
    {
      title: 'Flawless 3.50ct Solitaire Diamond Platinum Necklace',
      url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1000&auto=format&fit=crop&q=85',
      label: 'Diamond Necklace',
    },
    {
      title: '18K Yellow Gold Cartier Love Bangle Diamond Pave',
      url: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1000&auto=format&fit=crop&q=85',
      label: 'Cartier Gold Bangle',
    },
  ],
  Electronics: [
    {
      title: 'Leica M11 Rangefinder Digital Camera Silver Edition',
      url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1000&auto=format&fit=crop&q=85',
      label: 'Leica M11 Camera',
    },
    {
      title: 'Hasselblad 907X 50C Medium Format Camera',
      url: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1000&auto=format&fit=crop&q=85',
      label: 'Hasselblad Medium',
    },
    {
      title: 'McIntosh MC275 Vacuum Tube Power Amplifier',
      url: 'https://images.unsplash.com/photo-1545454675-3531b543be5d?w=1000&auto=format&fit=crop&q=85',
      label: 'McIntosh Tube Amp',
    },
  ],
};

const CATEGORY_DEFAULT_IMAGES = {
  Watches: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000&auto=format&fit=crop&q=85',
  Vehicles: 'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?w=1000&auto=format&fit=crop&q=85',
  'Art & Collectibles': 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1000&auto=format&fit=crop&q=85',
  Jewelry: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1000&auto=format&fit=crop&q=85',
  Electronics: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=1000&auto=format&fit=crop&q=85',
};

export const CreateAuctionPage = () => {
  const { user } = useAuth();

  const [myListings, setMyListings] = useState([]);
  const [loadingListings, setLoadingListings] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Watches');
  const [imageUrls, setImageUrls] = useState(['']);
  const [startingPrice, setStartingPrice] = useState('500');
  const [minIncrement, setMinIncrement] = useState('25');
  const [reservePrice, setReservePrice] = useState('800');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  useEffect(() => {
    const now = new Date();
    const end = new Date(now.getTime() + 2 * 60 * 60 * 1000);

    const formatForInput = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };

    setStartTime(formatForInput(now));
    setEndTime(formatForInput(end));
  }, []);

  const handleImageUrlChange = (index, value) => {
    const updated = [...imageUrls];
    updated[index] = value;
    setImageUrls(updated);
  };

  const addImageUrlField = () => {
    if (imageUrls.length < 5) {
      setImageUrls([...imageUrls, '']);
    }
  };

  const removeImageUrlField = (index) => {
    if (imageUrls.length > 1) {
      setImageUrls(imageUrls.filter((_, i) => i !== index));
    } else {
      setImageUrls(['']);
    }
  };

  const applyPreset = (preset) => {
    if (!title || title.trim() === '') {
      setTitle(preset.title);
    }
    setImageUrls([preset.url]);
  };

  const fetchMyListings = async () => {
    if (!user) return;
    try {
      setLoadingListings(true);
      const res = await api.getAuctions({ sellerId: user.id });
      if (res.success) {
        setMyListings(res.data);
      }
    } catch (err) {
      console.error('[Fetch Listings Error]', err);
    } finally {
      setLoadingListings(false);
    }
  };

  useEffect(() => {
    fetchMyListings();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!title || !description || !startingPrice || !startTime || !endTime) {
      setFormError('Please fill in all required fields.');
      return;
    }

    const validImages = imageUrls.filter((url) => url && url.trim().length > 0);
    const finalImages = validImages.length > 0
      ? validImages
      : [CATEGORY_DEFAULT_IMAGES[category] || 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1000'];

    try {
      setSubmitting(true);
      const payload = {
        title,
        description,
        category,
        images: finalImages,
        startingPrice: Number(startingPrice),
        minIncrement: Number(minIncrement) || 10,
        reservePrice: Number(reservePrice) || 0,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      };

      const res = await api.createAuction(payload);
      if (res.success) {
        setFormSuccess('Auction created successfully in DRAFT state! Awaiting Admin approval.');
        setTitle('');
        setDescription('');
        setImageUrls(['']);
        fetchMyListings();
      }
    } catch (err) {
      setFormError(err.message || 'Error creating auction');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (auctionId) => {
    if (!window.confirm('Are you sure you want to delete this DRAFT auction?')) return;
    try {
      await api.deleteAuction(auctionId);
      fetchMyListings();
    } catch (err) {
      alert(err.message || 'Error deleting auction');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-black tracking-tight">
          Seller Portal & Listing Management
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Create timed auctions, configure reserve prices, and manage active listings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left: Create Form */}
        <div className="lg:col-span-6 card-surface p-5 sm:p-6 bg-white border border-slate-200 space-y-5">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
            <div className="p-2.5 bg-amber-50 text-[#D4AF37] border border-amber-200 rounded-xl">
              <PlusCircle size={22} />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-black">Create New Auction</h3>
              <p className="text-[11px] text-slate-500">Listings are created in DRAFT state for admin review.</p>
            </div>
          </div>

          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle size={16} className="text-red-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {formSuccess && (
            <div className="p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check size={16} className="text-green-600 shrink-0" />
              <span>{formSuccess}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-extrabold text-black uppercase tracking-wider mb-1">
                Auction Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. 1967 Shelby GT500 Fastback"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white"
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block font-extrabold text-[#0F172A] uppercase tracking-wider text-xs">
                  Category *
                </label>
                <span className="text-[10px] text-slate-400 font-bold">Select category to view presets</span>
              </div>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Quick 1-Click Curated Sample Presets */}
            {CATEGORY_PRESETS[category] && (
              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[11px] font-black text-[#8C6608]">
                    <Sparkles size={13} className="text-[#D4AF37]" />
                    <span>Quick 1-Click Presets for {category}</span>
                  </div>
                  <span className="text-[9px] text-slate-500 font-semibold">Click to auto-fill title & image</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {CATEGORY_PRESETS[category].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => applyPreset(preset)}
                      className="group p-1.5 bg-white hover:bg-amber-100/50 border border-[#E8DEBE] hover:border-[#D4AF37] rounded-xl text-left transition-all flex flex-col items-center text-center shadow-xs"
                    >
                      <div className="w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 mb-1 relative">
                        <img
                          src={preset.url}
                          alt={preset.label}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      </div>
                      <span className="text-[10px] font-black text-[#0F172A] line-clamp-1">
                        {preset.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Multiple Image URLs & Gallery Inputs */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-extrabold text-[#0F172A] uppercase tracking-wider text-xs">
                  Listing Image URLs ({imageUrls.filter((u) => u.trim()).length} / 5) *
                </label>
                {imageUrls.length < 5 && (
                  <button
                    type="button"
                    onClick={addImageUrlField}
                    className="inline-flex items-center gap-1 text-[11px] font-black text-[#8C6608] hover:text-black transition-colors"
                  >
                    <Plus size={13} />
                    <span>Add Another Photo URL</span>
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <input
                        type="url"
                        value={url}
                        onChange={(e) => handleImageUrlChange(idx, e.target.value)}
                        placeholder={
                          idx === 0
                            ? 'Primary photo URL: https://images.unsplash.com/...'
                            : `Additional photo #${idx + 1} URL`
                        }
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white"
                      />
                    </div>

                    {/* Thumbnail preview */}
                    {url && url.trim() && (
                      <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#E8DEBE] shrink-0 bg-slate-100">
                        <img
                          src={url}
                          alt="preview"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = CATEGORY_DEFAULT_IMAGES[category];
                          }}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {imageUrls.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeImageUrlField(idx)}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="Remove photo URL"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-extrabold text-black uppercase tracking-wider mb-1">
                Description & Specifications *
              </label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide detailed condition, provenance, and specifications..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white text-black font-medium"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              <div>
                <label className="block font-extrabold text-black uppercase tracking-wider mb-1">
                  Starting Price ($) *
                </label>
                <input
                  type="number"
                  min="1"
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-black focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block font-extrabold text-black uppercase tracking-wider mb-1">
                  Min Step ($)
                </label>
                <input
                  type="number"
                  min="1"
                  value={minIncrement}
                  onChange={(e) => setMinIncrement(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-black focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block font-extrabold text-black uppercase tracking-wider mb-1">
                  Reserve ($)
                </label>
                <input
                  type="number"
                  min="0"
                  value={reservePrice}
                  onChange={(e) => setReservePrice(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold font-mono text-black focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  placeholder="Optional"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-extrabold text-black uppercase tracking-wider mb-1">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  required
                />
              </div>

              <div>
                <label className="block font-extrabold text-black uppercase tracking-wider mb-1">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary py-3 rounded-2xl font-extrabold text-xs sm:text-sm shadow-md shadow-amber-500/20 mt-2"
            >
              {submitting ? 'Submitting Auction...' : 'Create Listing (Draft)'}
            </button>
          </form>
        </div>

        {/* Right: Listings Table */}
        <div className="lg:col-span-6 card-surface p-5 sm:p-6 bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <Package size={20} className="text-[#D4AF37]" />
              <h3 className="font-heading font-extrabold text-base sm:text-lg text-black">My Listings ({myListings.length})</h3>
            </div>
            <span className="text-xs text-slate-400 font-bold">Seller: {user?.name}</span>
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {loadingListings ? (
              <div className="py-8 text-center text-xs text-slate-400">Loading listings...</div>
            ) : myListings.length > 0 ? (
              myListings.map((auc) => {
                const isDraft = auc.status === 'DRAFT';
                const canEditOrDelete = isDraft && auc.totalBids === 0;

                return (
                  <div
                    key={auc._id}
                    className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={auc.images?.[0] || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}
                        alt={auc.title}
                        className="w-11 h-11 rounded-xl object-cover bg-slate-200"
                      />
                      <div>
                        <div className="font-extrabold text-black line-clamp-1">{auc.title}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5 font-bold">
                          <span>{auc.category}</span>
                          <span>•</span>
                          <span className="font-mono text-black">${auc.currentHighestBid || auc.startingPrice}</span>
                          <span>•</span>
                          <span>{auc.totalBids} bids</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`badge ${
                          auc.status === 'LIVE'
                            ? 'badge-live'
                            : auc.status === 'SCHEDULED'
                            ? 'badge-scheduled'
                            : auc.status === 'SETTLED'
                            ? 'badge-settled'
                            : 'badge-draft'
                        }`}
                      >
                        {auc.status}
                      </span>

                      {canEditOrDelete && (
                        <button
                          onClick={() => handleDelete(auc._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete DRAFT listing"
                        >
                          <Trash2 size={15} />
                        </button>
                      )}

                      <Link
                        to={`/auctions/${auc._id}`}
                        className="p-1.5 text-slate-500 hover:text-black hover:bg-slate-200 rounded-lg transition-colors"
                        title="View Listing"
                      >
                        <ExternalLink size={15} />
                      </Link>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-12 text-center text-xs text-slate-400 font-medium">
                No listings created yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
