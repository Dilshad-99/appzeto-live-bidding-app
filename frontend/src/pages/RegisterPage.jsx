import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Gavel, User, Mail, Lock, ArrowRight, AlertCircle } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('BIDDER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const res = await register(name, email, password, role);
      if (res.success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-16 space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-black text-[#D4AF37] border border-[#D4AF37]/50 rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <Gavel size={26} />
        </div>
        <h2 className="text-2xl font-extrabold font-heading text-black tracking-tight">
          Create an Account
        </h2>
        <p className="text-xs text-slate-500">
          Join AuctionHub as a Bidder or Seller.
        </p>
      </div>

      <div className="card-surface p-6 bg-white border border-slate-200 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4 text-xs">
          <div>
            <label className="block font-extrabold text-black uppercase tracking-wider mb-1">
              Full Name
            </label>
            <div className="relative">
              <User size={16} className="absolute inset-y-0 left-3 my-auto text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-extrabold text-black uppercase tracking-wider mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail size={16} className="absolute inset-y-0 left-3 my-auto text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block font-extrabold text-black uppercase tracking-wider mb-1">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute inset-y-0 left-3 my-auto text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white"
                required
                minLength={6}
              />
            </div>
          </div>

          <div>
            <label className="block font-extrabold text-black uppercase tracking-wider mb-1">
              Account Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('BIDDER')}
                className={`py-2.5 px-3 rounded-xl font-extrabold text-xs border text-center transition-all ${
                  role === 'BIDDER'
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Bidder ($5k Demo Balance)
              </button>
              <button
                type="button"
                onClick={() => setRole('SELLER')}
                className={`py-2.5 px-3 rounded-xl font-extrabold text-xs border text-center transition-all ${
                  role === 'SELLER'
                    ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                Seller (List Items)
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 rounded-2xl font-extrabold text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 mt-2"
          >
            <span>{loading ? 'Creating Account...' : 'Sign Up'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="font-extrabold text-black hover:text-[#B8860B] hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
