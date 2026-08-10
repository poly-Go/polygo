import { ConnectButton } from '../Home/ConnectButton';
import { Link } from 'react-router-dom';
import { useState, useRef, useEffect } from 'react';
import { useNotification } from '../../context/NotificationContext';
import { useAccount } from 'wagmi';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const [refreshSpinning, setRefreshSpinning] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);
  const { notifications, unreadCount, markAllRead, markAsRead, addNotification } = useNotification();
  const { isConnected } = useAccount();
  const navigate = useNavigate();

  // Close bell dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) {
        setBellOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleRefresh = () => {
    setRefreshSpinning(true);
    setTimeout(() => {
      setRefreshSpinning(false);
      if (isConnected) {
        addNotification('Balances Updated', 'Your PLP, USDT and referral balances have been refreshed.');
      }
    }, 800);
  };

  const formatTime = (ts: number) => {
    const diff = Date.now() - ts;
    if (diff < 60_000) return 'just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    return new Date(ts).toLocaleDateString();
  };

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-xl border-b border-indigo-100 shadow-sm">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        {/* Logo - Bigger size */}
        <Link to="/" className="flex items-center gap-3 shrink-0 group">
          {/* Option A: If you have logo.png in public folder */}
          <img 
            src="/logo.png" 
            alt="PolyGo" 
            className="h-12 w-12 rounded-xl shadow-md shadow-indigo-100 group-hover:shadow-indigo-200 transition-shadow duration-200"
          />
          {/* Option B: If no image, use this div instead of img above */}
          {/* <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200 group-hover:shadow-indigo-300 transition-shadow duration-200">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div> */}
          
          <span className="font-bold text-2xl bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            PolyGo
          </span>
        </Link>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          {/* Refresh icon */}
          <button
            onClick={handleRefresh}
            title="Refresh balances"
            className={`icon-btn ${refreshSpinning ? 'text-indigo-600' : ''}`}
          >
            <svg
              className={`h-5 w-5 ${refreshSpinning ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>

          {/* Bell with dropdown */}
          <div className="relative" ref={bellRef}>
            <button
              onClick={() => setBellOpen(prev => !prev)}
              className={`icon-btn relative ${bellOpen ? 'text-indigo-600 bg-indigo-50' : ''}`}
              title="Notifications"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-[10px] font-bold flex items-center justify-center shadow">
                  {unreadCount}
                </span>
              )}
            </button>

            {bellOpen && (
              <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl shadow-purple-500/10 border border-indigo-100 overflow-hidden z-50">
                <div className="flex items-center justify-between px-4 py-3 border-b border-indigo-50 bg-gradient-to-r from-indigo-50/50 to-purple-50/50">
                  <h4 className="font-semibold text-slate-800 text-sm">Notifications</h4>
                  <div className="flex items-center gap-2">
                    {notifications.length > 0 && (
                      <button
                        onClick={markAllRead}
                        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-slate-400">
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map(n => (
                      <button
                        key={n.id}
                        onClick={() => markAsRead(n.id)}
                        className={`w-full text-left px-4 py-3 border-b border-indigo-50/60 hover:bg-indigo-50/40 transition flex gap-3 ${
                          n.read ? 'opacity-60' : ''
                        }`}
                      >
                        <span
                          className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${
                            n.read ? 'bg-slate-200' : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                          }`}
                        ></span>
                        <span className="flex-1">
                          <span className="block text-sm font-medium text-slate-800">{n.title}</span>
                          <span className="block text-xs text-slate-500 mt-0.5 leading-relaxed">{n.message}</span>
                          <span className="block text-[11px] text-slate-400 mt-1">{formatTime(n.time)}</span>
                        </span>
                      </button>
                    ))
                  )}
                </div>
                <button
                  onClick={() => navigate('/support')}
                  className="w-full py-2.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 transition border-t border-indigo-50"
                >
                  View Support & FAQ
                </button>
              </div>
            )}
          </div>

          {/* Wallet connect button */}
          <ConnectButton />
        </div>
      </div>
    </header>
  );
};