import { useEffect, useRef, useState } from 'react';
import { useNotification } from '../../context/NotificationContext';

const Icons = {
  success: (
    <svg className="h-7 w-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  error: (
    <svg className="h-7 w-7 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  info: (
    <svg className="h-7 w-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  pending: (
    <svg className="h-7 w-7 text-amber-400 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
};

const config = {
  success: {
    iconBg: 'bg-emerald-500/15 border border-emerald-500/20',
    glow: 'bg-gradient-to-r from-emerald-500/30 via-emerald-400/20 to-emerald-500/30',
    progress: 'bg-emerald-400',
    statusColor: 'text-emerald-400',
    duration: 4000,
  },
  error: {
    iconBg: 'bg-rose-500/15 border border-rose-500/20',
    glow: 'bg-gradient-to-r from-rose-500/30 via-rose-400/20 to-rose-500/30',
    progress: 'bg-rose-400',
    statusColor: 'text-rose-400',
    duration: 5000,
  },
  info: {
    iconBg: 'bg-blue-500/15 border border-blue-500/20',
    glow: 'bg-gradient-to-r from-blue-500/30 via-blue-400/20 to-blue-500/30',
    progress: 'bg-blue-400',
    statusColor: 'text-blue-400',
    duration: 3000,
  },
  pending: {
    iconBg: 'bg-amber-500/15 border border-amber-500/20',
    glow: 'bg-gradient-to-r from-amber-500/30 via-amber-400/20 to-amber-500/30',
    progress: 'bg-amber-400',
    statusColor: 'text-amber-400',
    duration: 0, // ✅ No auto-close for pending
  },
};

export const ToastContainer = () => {
  const { toast, hideToast } = useNotification();
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const isPending = toast?.type === 'pending';
  const isMounted = useRef(true);

  // ✅ Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, []);

  // ✅ Entry animation
  useEffect(() => {
    if (toast) {
      setVisible(true);
    } else {
      setVisible(false);
    }
  }, [toast?.id]);

  // ✅ Auto-dismiss ONLY for non-pending toasts
  useEffect(() => {
    // Clear existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // ❌ PENDING toast: NO auto-dismiss
    if (isPending || !toast) {
      if (progressRef.current) {
        progressRef.current.style.transition = 'none';
        progressRef.current.style.width = '100%';
      }
      return;
    }

    const duration = config[toast.type]?.duration || 4000;

    // Start progress bar animation
    if (progressRef.current) {
      progressRef.current.style.transition = 'none';
      progressRef.current.style.width = '100%';
      // Force reflow
      void progressRef.current.offsetWidth;
      progressRef.current.style.transition = `width ${duration}ms linear`;
      progressRef.current.style.width = '0%';
    }

    // ✅ Set timer to hide toast
    timerRef.current = setTimeout(() => {
      if (isMounted.current) {
        setVisible(false);
        // ✅ Hide after animation completes
        setTimeout(() => {
          if (isMounted.current) {
            hideToast();
          }
        }, 300);
      }
    }, duration);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [toast, hideToast, isPending]);

  // ✅ Manual hide handler
  const handleHide = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
    setTimeout(() => {
      if (isMounted.current) {
        hideToast();
      }
    }, 300);
  };

  if (!toast) return null;

  const style = config[toast.type];

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-opacity duration-300 ${
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Backdrop blur overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={handleHide} />

      {/* Glass Card */}
      <div
        className={`relative w-full max-w-[420px] transition-all duration-500 ${
          visible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
        }`}
        style={{ transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)' }}
      >
        {/* Animated glow border */}
        <div className={`absolute -inset-[1px] rounded-3xl blur-sm opacity-100 ${style.glow}`} />

        <div className="relative backdrop-blur-2xl bg-slate-900/60 border border-white/10 rounded-3xl shadow-[0_8px_32px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.1)] p-6 overflow-hidden">
          
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-24 h-24 bg-gradient-to-br from-white/5 to-transparent rounded-tl-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-white/5 to-transparent rounded-br-3xl pointer-events-none" />

          <div className="relative z-10">
            {/* Top Row */}
            <div className="flex items-start gap-4">
              {/* Icon */}
              <div className={`h-14 w-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${style.iconBg}`}>
                {Icons[toast.type]}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 pt-0.5">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white tracking-tight">{toast.title}</h3>
                  <button
                    onClick={handleHide}
                    className="shrink-0 text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-white/10 -mt-1 -mr-1"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <p className="text-sm text-slate-300 mt-1.5 leading-relaxed font-medium break-words">
                  {toast.message}
                </p>

                {/* Bonus Pill */}
                {toast.bonus && (
                  <div className="mt-3">
                    <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-emerald-500/15 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
                      <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-sm font-bold text-emerald-400">{toast.bonus}</span>
                    </div>
                  </div>
                )}

                {/* TX Link */}
                {toast.txHash && (
                  <a
                    href={`https://polygonscan.com/tx/${toast.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition group"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    View on PolygonScan
                    <svg className="h-3 w-3 transition group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
              </div>
            </div>

            {/* Bottom: Progress + Status */}
            <div className="mt-5 flex items-center gap-3">
              <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
                <div
                  ref={progressRef}
                  className={`h-full rounded-full ${style.progress}`}
                  style={{ 
                    width: isPending ? '100%' : '100%',
                  }}
                />
              </div>
              <span className={`text-[10px] font-semibold uppercase tracking-wider ${style.statusColor}`}>
                {isPending ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                    Processing
                  </span>
                ) : (
                  'Confirmed'
                )}
              </span>
            </div>

            {/* Pending message */}
            {isPending && (
              <div className="mt-3 text-center">
                <p className="text-[10px] text-slate-400">
                  ⏳ Waiting for transaction confirmation...
                  <br />
                  <span className="text-[9px] text-slate-500">This may take a few moments</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};