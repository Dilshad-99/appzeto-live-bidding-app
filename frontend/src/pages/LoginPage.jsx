import React, { useState } from 'react';
import { useAuth, DEMO_USERS } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Gavel, Sparkles, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';

export const LoginPage = () => {
  const { login, switchDemoUser } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.success) {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemo = async (demoEmail) => {
    try {
      setLoading(true);
      await switchDemoUser(demoEmail);
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-16 space-y-6 animate-fade-in">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-black text-[#D4AF37] border border-[#D4AF37]/50 rounded-2xl flex items-center justify-center mx-auto shadow-md">
          <Gavel size={26} />
        </div>
        <h2 className="text-2xl font-extrabold font-heading text-black tracking-tight">
          Sign In to Auction<span className="text-[#D4AF37]">Hub</span>
        </h2>
        <p className="text-xs text-slate-500">
          Access real-time bidding, wallet balance, and listing management.
        </p>
      </div>

      {/* Evaluator 1-Click Persona Box */}
      <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2.5">
        <div className="flex items-center gap-1.5 text-xs font-extrabold text-black">
          <Sparkles size={14} className="text-[#D4AF37]" />
          <span>One-Click Evaluator Personas:</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {DEMO_USERS.map((demo) => (
            <button
              key={demo.email}
              type="button"
              onClick={() => handleQuickDemo(demo.email)}
              className="p-2.5 bg-white border border-amber-200/80 hover:border-[#D4AF37] rounded-xl text-left shadow-sm hover:shadow transition-all group"
            >
              <div className="text-xs font-extrabold text-black group-hover:text-[#B8860B] line-clamp-1">
                {demo.name.split(' ')[0]}
              </div>
              <div className="text-[10px] text-slate-500 font-bold">{demo.role}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Form Card */}
      <div className="card-surface p-6 bg-white border border-slate-200 space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-bold flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
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
                placeholder="you@example.com"
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
                placeholder="••••••••"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-bold text-black focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-3 rounded-2xl font-extrabold text-xs sm:text-sm shadow-md shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500 font-medium">
          Don't have an account?{' '}
          <Link to="/register" className="font-extrabold text-black hover:text-[#B8860B] hover:underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
};
