import { useState } from 'react';
import BuySell from '../components/Marketplace/BuySell';
import Orders from '../components/Marketplace/Orders';

export default function Marketplace() {
  const [tab, setTab] = useState<'buySell' | 'orders'>('buySell');

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Marketplace</h1>
        <p className="text-sm text-slate-500 mt-1">Buy PLP with USDT or manage your sell orders.</p>
      </div>

      {/* Tabs */}
      <div className="card p-1.5 flex gap-1.5">
        <button
          onClick={() => setTab('buySell')}
          className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 ${
            tab === 'buySell'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/25'
              : 'text-slate-500 hover:text-slate-700 hover:bg-indigo-50/50'
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h2m4 0h4M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
          </svg>
          Buy / Sell
        </button>
        <button
          onClick={() => setTab('orders')}
          className={`flex-1 px-4 py-2.5 text-sm font-semibold rounded-xl transition flex items-center justify-center gap-2 ${
            tab === 'orders'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-purple-500/25'
              : 'text-slate-500 hover:text-slate-700 hover:bg-indigo-50/50'
          }`}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
          Orders
        </button>
      </div>

      {tab === 'buySell' ? <BuySell /> : <Orders />}
    </div>
  );
}

