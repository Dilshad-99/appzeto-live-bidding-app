import React from 'react';
import { useSocket } from '../context/SocketContext';
import { AlertCircle, Trophy, Bell, X, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Toast = () => {
  const { notifications, removeNotification } = useSocket();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-md w-full pointer-events-none">
      {notifications.map((notif) => {
        const isOutbid = notif.type === 'OUTBID';
        const isWon = notif.type === 'WON';

        return (
          <div
            key={notif.id}
            className={`pointer-events-auto p-4 rounded-xl shadow-xl border flex items-start gap-3.5 backdrop-blur-md animate-fade-in ${
              isOutbid
                ? 'bg-red-50/95 border-red-300 text-red-950 outbid-pulse'
                : isWon
                ? 'bg-purple-50/95 border-purple-300 text-purple-950'
                : 'bg-white/95 border-slate-200 text-slate-900'
            }`}
          >
            <div
              className={`p-2 rounded-lg shrink-0 ${
                isOutbid ? 'bg-red-600 text-white' : isWon ? 'bg-purple-600 text-white' : 'bg-slate-800 text-white'
              }`}
            >
              {isOutbid ? <AlertCircle size={20} /> : isWon ? <Trophy size={20} /> : <Bell size={20} />}
            </div>

            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm leading-snug">{notif.title}</h4>
              <p className="text-xs mt-0.5 opacity-90 leading-relaxed">{notif.message}</p>
              {notif.auctionId && (
                <Link
                  to={`/auctions/${notif.auctionId}`}
                  className={`inline-flex items-center gap-1 text-xs font-bold mt-2 hover:underline ${
                    isOutbid ? 'text-red-700' : isWon ? 'text-purple-700' : 'text-slate-800'
                  }`}
                  onClick={() => removeNotification(notif.id)}
                >
                  {isOutbid ? 'Rebid Now' : 'View Auction'} <ArrowRight size={12} />
                </Link>
              )}
            </div>

            <button
              onClick={() => removeNotification(notif.id)}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-md transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
