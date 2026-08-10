import { useAppKit } from '@reown/appkit/react';
import { useAccount, useDisconnect } from 'wagmi';

export const ConnectButton = () => {
  const { open } = useAppKit();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  if (!isConnected) {
    return (
      <button
        onClick={() => open()}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-lg shadow-purple-500/25 hover:from-indigo-600 hover:to-purple-600 transition active:scale-[0.98] shrink-0"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656m-5.657 0a8 8 0 010-11.314m11.314 0a12.05 12.05 0 010 17.07M5.758 14.414a8 8 0 010-4.828M7 12h10" />
        </svg>
        <span>Connect Wallet</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2 shrink-0">
      <div className="flex items-center gap-2 bg-white border border-indigo-100 shadow-sm px-3 py-1.5 rounded-xl">
        <span className="relative flex h-2.5 w-2.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
        </span>
        <span className="text-sm font-medium text-slate-700 font-mono">
          {address?.slice(0, 6)}…{address?.slice(-4)}
        </span>
      </div>
      <button
        onClick={() => disconnect()}
        title="Disconnect wallet"
        className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition"
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
        </svg>
      </button>
    </div>
  );
};

