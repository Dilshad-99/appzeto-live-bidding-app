import React, { useState, useEffect } from 'react';
import { Clock, Zap } from 'lucide-react';

export const CountdownTimer = ({ endTime, startTime, status, onEnd, compact = false }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
  const [isEndingSoon, setIsEndingSoon] = useState(false);

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      let targetTime = new Date(endTime).getTime();

      if (status === 'SCHEDULED' && startTime) {
        targetTime = new Date(startTime).getTime();
      }

      const difference = targetTime - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, totalMs: 0 });
        if (onEnd) onEnd();
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({ days, hours, minutes, seconds, totalMs: difference });
      setIsEndingSoon(status === 'LIVE' && difference <= 120000); // 2 minutes anti-sniping window
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [endTime, startTime, status, onEnd]);

  if (status === 'CLOSED' || status === 'SETTLED' || status === 'CANCELLED') {
    return (
      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
        <Clock size={14} />
        <span>Auction Ended</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-1.5 text-xs font-bold ${isEndingSoon ? 'text-red-600 animate-pulse' : 'text-slate-700'}`}>
        <Clock size={13} className={isEndingSoon ? 'text-red-600' : 'text-slate-500'} />
        {status === 'SCHEDULED' ? 'Starts in: ' : ''}
        <span>
          {timeLeft.days > 0 && `${timeLeft.days}d `}
          {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </span>
        {isEndingSoon && (
          <span className="flex items-center gap-0.5 text-[10px] bg-red-100 text-red-700 px-1 py-0.5 rounded font-bold">
            <Zap size={10} /> Snipe Guard
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5">
      {isEndingSoon && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg animate-pulse">
          <Zap size={14} />
          <span>Anti-Sniping Active: Bids within 2m extend timer +2m!</span>
        </div>
      )}
      <div className="flex items-center gap-2">
        <div className="flex flex-col items-center justify-center bg-white text-[#0F172A] rounded-xl px-2.5 py-1.5 min-w-[44px] shadow-xs border border-[#D4AF37]/60">
          <span className="text-xl font-black font-mono text-[#0F172A] leading-none">
            {String(timeLeft.days > 0 ? timeLeft.days : timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-[#8C6608] font-black uppercase tracking-wider mt-0.5">{timeLeft.days > 0 ? 'Days' : 'Hours'}</span>
        </div>
        <span className="text-[#D4AF37] font-black text-lg">:</span>
        <div className="flex flex-col items-center justify-center bg-white text-[#0F172A] rounded-xl px-2.5 py-1.5 min-w-[44px] shadow-xs border border-[#D4AF37]/60">
          <span className="text-xl font-black font-mono text-[#0F172A] leading-none">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-[#8C6608] font-black uppercase tracking-wider mt-0.5">Mins</span>
        </div>
        <span className="text-[#D4AF37] font-black text-lg">:</span>
        <div className={`flex flex-col items-center justify-center rounded-xl px-2.5 py-1.5 min-w-[44px] shadow-xs border ${isEndingSoon ? 'bg-red-600 text-white border-red-500' : 'bg-white text-[#0F172A] border-[#D4AF37]/60'}`}>
          <span className={`text-xl font-black font-mono leading-none ${isEndingSoon ? 'text-white' : 'text-[#0F172A]'}`}>
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className={`text-[10px] font-black uppercase tracking-wider mt-0.5 ${isEndingSoon ? 'text-white' : 'text-[#8C6608]'}`}>Secs</span>
        </div>
      </div>
    </div>
  );
};
