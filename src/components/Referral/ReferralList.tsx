import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, PLP_ABI } from '../../constants';
import { useState, useEffect } from 'react';

export const ReferralList = () => {
  const { address } = useAccount();
  const [referrals, setReferrals] = useState<`0x${string}`[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);

  const { data: referralsData, isLoading, error, refetch } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'getDirectReferralsPaginated',
    args: [address as `0x${string}`, 0, 100],
    query: { 
      enabled: !!address,
    },
  });

  // ✅ Handle data properly
  useEffect(() => {
    if (referralsData) {
      console.log('📊 Referrals Data:', referralsData);
      
      // Check if it's an array with two elements
      if (Array.isArray(referralsData) && referralsData.length >= 2) {
        const list = referralsData[0] as `0x${string}`[];
        const total = referralsData[1] as bigint;
        
        setReferrals(list || []);
        setTotalCount(total ? Number(total) : 0);
      }
    }
  }, [referralsData]);

  if (!address) return null;

  // ✅ Show loading state
  if (isLoading) {
    return (
      <div className="card p-5">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm">👥</span>
            <h3 className="text-lg font-semibold text-slate-800">Direct Referrals</h3>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold animate-pulse">
            Loading...
          </span>
        </div>
        <div className="bg-indigo-50/50 rounded-xl p-6 text-center">
          <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="h-4 w-32 bg-indigo-200 rounded"></div>
            <div className="h-3 w-24 bg-indigo-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Show error if any
  if (error) {
    console.error('❌ Referral fetch error:', error);
    return (
      <div className="card p-5">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm">👥</span>
            <h3 className="text-lg font-semibold text-slate-800">Direct Referrals</h3>
          </div>
        </div>
        <div className="bg-rose-50/50 rounded-xl p-6 text-center border border-rose-100">
          <p className="text-rose-600 text-sm">⚠️ Error loading referrals</p>
          <button 
            onClick={() => refetch()} 
            className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-5">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm">👥</span>
          <h3 className="text-lg font-semibold text-slate-800">Direct Referrals</h3>
        </div>
        <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold">
          Total: {totalCount}
        </span>
      </div>
      
      {referrals.length === 0 ? (
        <div className="bg-indigo-50/50 rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">👤</div>
          <p className="text-slate-500 text-sm font-medium">No referrals yet.</p>
          <p className="text-slate-400 text-xs mt-1">Share your referral link to start earning!</p>
          <button 
            onClick={() => refetch()} 
            className="mt-3 text-xs text-indigo-500 hover:text-indigo-700 font-medium"
          >
            Refresh
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
            {referrals.map((addr, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-sm bg-gradient-to-b from-indigo-50/50 to-white border border-indigo-50 rounded-xl px-3.5 py-2.5 hover:shadow-sm transition-shadow duration-200"
              >
                <div className="flex items-center gap-2">
                  <span className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <span className="font-mono text-slate-700 text-sm">
                    {addr.slice(0, 6)}…{addr.slice(-4)}
                  </span>
                </div>
                <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  Active
                </span>
              </div>
            ))}
          </div>
          
          {/* Refresh Button */}
          <button
            onClick={() => refetch()}
            className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors duration-200"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh List
          </button>
        </>
      )}
    </div>
  );
};