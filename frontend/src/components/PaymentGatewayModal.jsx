import React, { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import confetti from 'canvas-confetti';
import {
  CreditCard,
  QrCode,
  Building2,
  CheckCircle2,
  ShieldCheck,
  Lock,
  ArrowRight,
  X,
  Smartphone,
  Check,
  AlertCircle,
  RefreshCw,
  DollarSign,
} from 'lucide-react';

export const PaymentGatewayModal = ({ isOpen, onClose }) => {
  const { topup, wallet } = useWallet();

  const [amount, setAmount] = useState('1000');
  const [paymentMethod, setPaymentMethod] = useState('CARD'); // 'CARD' | 'UPI' | 'NETBANKING' | 'FAST'
  const [step, setStep] = useState('SELECT'); // 'SELECT' | 'PROCESSING' | 'OTP' | 'SUCCESS'
  const [otp, setOtp] = useState('');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('892');
  const [cardName, setCardName] = useState('Alex Rivera');
  const [upiId, setUpiId] = useState('alex@okhdfcbank');
  const [selectedBank, setSelectedBank] = useState('HDFC');
  const [paymentId, setPaymentId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const quickAmounts = [250, 500, 1000, 2500, 5000];

  const handleStartPayment = (e) => {
    e.preventDefault();
    const num = Number(amount);
    if (!num || num <= 0) {
      setErrorMsg('Please enter a valid amount');
      return;
    }

    setErrorMsg('');
    setStep('PROCESSING');

    // Simulate 3D Secure Verification flow
    setTimeout(() => {
      if (paymentMethod === 'CARD') {
        setStep('OTP');
      } else {
        completePayment(num);
      }
    }, 1200);
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setStep('PROCESSING');
    setTimeout(() => {
      completePayment(Number(amount));
    }, 1000);
  };

  const completePayment = async (numAmount) => {
    try {
      const pId = `PAY_${Math.floor(100000 + Math.random() * 900000)}_${Date.now().toString().slice(-4)}`;
      setPaymentId(pId);
      await topup(numAmount);

      confetti({
        particleCount: 100,
        spread: 60,
        origin: { y: 0.6 }
      });

      setStep('SUCCESS');
    } catch (err) {
      setErrorMsg(err.message || 'Payment processing failed');
      setStep('SELECT');
    }
  };

  const handleReset = () => {
    setStep('SELECT');
    setOtp('');
    setErrorMsg('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Top Gold Accent Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#E5C058] via-[#D4AF37] to-[#B8860B]"></div>

        <button
          onClick={handleReset}
          className="absolute top-4 right-4 text-slate-400 hover:text-black p-1.5 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X size={20} />
        </button>

        {/* STEP 1: SELECT PAYMENT METHOD & AMOUNT */}
        {step === 'SELECT' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-50 text-[#D4AF37] border border-amber-200 rounded-2xl">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold font-heading text-black">
                  Secure Payment Gateway
                </h3>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                  <Lock size={12} className="text-emerald-600" />
                  <span>256-Bit SSL Encrypted • Instant Wallet Credit</span>
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-xl text-xs font-semibold flex items-center gap-2">
                <AlertCircle size={16} className="text-red-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick Amount Selector */}
            <div>
              <label className="block text-xs font-extrabold text-black uppercase tracking-wider mb-2">
                Select Deposit Amount
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {quickAmounts.map((amt) => (
                  <button
                    type="button"
                    key={amt}
                    onClick={() => setAmount(String(amt))}
                    className={`py-2 px-2 rounded-xl text-xs font-extrabold border transition-all ${
                      amount === String(amt)
                        ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-md shadow-amber-200 scale-105'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    +${amt}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Amount Input */}
            <div>
              <label className="block text-xs font-extrabold text-black uppercase tracking-wider mb-1">
                Custom Amount ($)
              </label>
              <div className="relative">
                <DollarSign size={18} className="absolute inset-y-0 left-3 my-auto text-slate-400" />
                <input
                  type="number"
                  min="1"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-lg font-extrabold text-black focus:outline-none focus:ring-2 focus:ring-[#D4AF37] focus:bg-white"
                  required
                />
              </div>
            </div>

            {/* Payment Method Selector Tabs */}
            <div>
              <label className="block text-xs font-extrabold text-black uppercase tracking-wider mb-2">
                Payment Channel
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'CARD'
                      ? 'border-[#D4AF37] bg-amber-50/60 text-black shadow-sm font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard size={20} className={paymentMethod === 'CARD' ? 'text-[#B8860B]' : 'text-slate-400'} />
                  <span className="text-xs font-extrabold">Card</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'UPI'
                      ? 'border-[#D4AF37] bg-amber-50/60 text-black shadow-sm font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone size={20} className={paymentMethod === 'UPI' ? 'text-[#B8860B]' : 'text-slate-400'} />
                  <span className="text-xs font-extrabold">UPI / QR</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('NETBANKING')}
                  className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                    paymentMethod === 'NETBANKING'
                      ? 'border-[#D4AF37] bg-amber-50/60 text-black shadow-sm font-bold'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Building2 size={20} className={paymentMethod === 'NETBANKING' ? 'text-[#B8860B]' : 'text-slate-400'} />
                  <span className="text-xs font-extrabold">Net Banking</span>
                </button>
              </div>
            </div>

            {/* Method Details Form */}
            {paymentMethod === 'CARD' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Card Number</label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs font-bold text-black focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Expiry</label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs font-bold text-black focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">CVV</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-mono text-xs font-bold text-black focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'UPI' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">UPI VPA ID</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="name@upi"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-black focus:outline-none focus:ring-1 focus:ring-[#D4AF37]"
                  />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  {['Google Pay', 'PhonePe', 'Paytm', 'BHIM'].map((app) => (
                    <button
                      type="button"
                      key={app}
                      onClick={() => setUpiId(`user@${app.toLowerCase().replace(' ', '')}`)}
                      className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 hover:border-[#D4AF37]"
                    >
                      {app}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {paymentMethod === 'NETBANKING' && (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Popular Banks</label>
                <div className="grid grid-cols-2 gap-2">
                  {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((b) => (
                    <button
                      type="button"
                      key={b}
                      onClick={() => setSelectedBank(b)}
                      className={`p-2 rounded-xl text-xs font-bold border text-left ${
                        selectedBank === b
                          ? 'border-[#D4AF37] bg-white text-black font-extrabold shadow-sm'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={handleStartPayment}
              className="w-full btn-primary py-3.5 rounded-2xl font-extrabold text-base shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
            >
              <span>Pay & Deposit ${Number(amount).toFixed(2)}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* STEP 2: PROCESSING SIMULATION */}
        {step === 'PROCESSING' && (
          <div className="py-12 text-center space-y-4 animate-fade-in">
            <div className="w-16 h-16 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin mx-auto"></div>
            <h3 className="text-lg font-extrabold text-black font-heading">
              Contacting Payment Gateway...
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              Establishing 256-bit encrypted handshake with banking servers. Please do not refresh.
            </p>
          </div>
        )}

        {/* STEP 3: 3D SECURE OTP SIMULATION */}
        {step === 'OTP' && (
          <div className="space-y-5 animate-fade-in">
            <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
              <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-black">3D Secure Verified by Visa/Mastercard</h3>
                <p className="text-[11px] text-slate-500">Amount: <strong className="text-black">${Number(amount).toFixed(2)}</strong></p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              A mock one-time password (OTP) was sent to your registered mobile number ending in <strong>•••• 9821</strong>.
            </p>

            <form onSubmit={handleOtpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Enter 6-Digit OTP</label>
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456 (or any code)"
                  className="w-full px-4 py-3 text-center tracking-widest font-mono text-xl font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full btn-primary py-3 rounded-xl font-bold text-sm shadow-md"
              >
                Authenticate & Complete Transfer
              </button>
            </form>
          </div>
        )}

        {/* STEP 4: PAYMENT SUCCESS RECEIPT */}
        {step === 'SUCCESS' && (
          <div className="py-6 text-center space-y-5 animate-fade-in">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 size={36} />
            </div>

            <div>
              <h3 className="text-2xl font-extrabold font-heading text-black">
                Payment Successful!
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Your wallet has been credited with <strong>+${Number(amount).toFixed(2)}</strong> instantly.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-slate-500">
                <span>Transaction Ref:</span>
                <span className="font-bold text-black">{paymentId}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Amount Paid:</span>
                <span className="font-bold text-emerald-600">+${Number(amount).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Payment Method:</span>
                <span className="font-bold text-black">{paymentMethod}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>New Available Balance:</span>
                <span className="font-bold text-black">${wallet.availableBalance.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReset}
              className="w-full btn-primary py-3 rounded-2xl font-bold text-sm shadow-md shadow-amber-500/20"
            >
              Return to Platform
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
