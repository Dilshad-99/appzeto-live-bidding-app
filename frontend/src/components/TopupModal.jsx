import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { Wallet, X, Check, DollarSign } from 'lucide-react';

export const TopupModal = ({ isOpen, onClose }) => {
  const { topup, wallet } = useWallet();
  const [amount, setAmount] = useState('500');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const quickAmounts = [250, 500, 1000, 2500, 5000];

  const handleTopup = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const num = Number(amount);
    if (!num || num <= 0) {
      setErrorMsg('Please enter a valid amount');
      return;
    }

    try {
      setLoading(true);
      await topup(num);
      setSuccessMsg(`Successfully credited $${num.toFixed(2)} to your wallet!`);
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to top up wallet');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-3 bg-purple-100 text-[#6D5EF5] rounded-xl">
            <Wallet size={24} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Wallet Top-Up</h3>
            <p className="text-xs text-slate-500">
              Current Available: <strong className="text-slate-900">${wallet.availableBalance.toFixed(2)}</strong>
            </p>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-800 rounded-xl text-xs font-semibold flex items-center gap-2">
            <Check size={16} className="text-green-600" />
            {successMsg}
          </div>
        )}

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleTopup}>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Quick Select Amount
          </label>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {quickAmounts.map((amt) => (
              <button
                type="button"
                key={amt}
                onClick={() => setAmount(String(amt))}
                className={`py-2.5 px-3 rounded-xl text-sm font-bold border transition-all ${
                  amount === String(amt)
                    ? 'bg-[#6D5EF5] text-white border-[#6D5EF5] shadow-md shadow-purple-200'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                +${amt}
              </button>
            ))}
          </div>

          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
            Custom Amount ($)
          </label>
          <div className="relative mb-6">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <DollarSign size={18} />
            </div>
            <input
              type="number"
              min="1"
              step="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-9 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold text-lg focus:outline-none focus:ring-2 focus:ring-[#6D5EF5] focus:bg-white"
              placeholder="Enter amount"
              required
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary py-3 rounded-xl font-bold text-sm shadow-lg shadow-purple-200"
            >
              {loading ? 'Processing...' : 'Deposit Funds'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
