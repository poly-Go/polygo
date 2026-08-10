import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, PLP_ABI, USDT_DECIMALS, USDT_ADDRESS, PLP_ADDRESS, CHAIN_ID } from '../../constants';
import { ERC20_ABI } from '../../abi/erc20Abi';
import { useState } from 'react';
import { formatUnits } from 'viem';

export const BalanceCard = () => {
  const { address } = useAccount();
  const [refreshing, setRefreshing] = useState(false);

  // ========== PLP Balance (ERC20 balanceOf, pinned to Polygon) ==========
  const {
    data: plpBalance,
    refetch: refetchPlp,
    isLoading: plpLoading,
    isError: plpError,
  } = useReadContract({
    chainId: CHAIN_ID,
    address: PLP_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  });

  // ========== USDT Balance (ERC20 balanceOf, pinned to Polygon) ==========
  const {
    data: usdtBalance,
    refetch: refetchUsdt,
    isLoading: usdtLoading,
    isError: usdtError,
  } = useReadContract({
    chainId: CHAIN_ID,
    address: USDT_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  });

  // ========== Referral Balance (contract read) ==========
  const {
    data: userBasic,
    refetch: refetchReferral,
    isLoading: referralLoading,
    isError: referralError,
  } = useReadContract({
    chainId: CHAIN_ID,
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'getUserBasicInfo',
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  });

  // ========== Format values ==========
  const plpVal = plpBalance ? Number(formatUnits(plpBalance as bigint, 18)).toFixed(2) : '0.00';
  const usdtVal = usdtBalance ? Number(formatUnits(usdtBalance as bigint, USDT_DECIMALS)).toFixed(2) : '0.00';
const basic = (userBasic ?? null) as readonly [string, bigint, bigint, bigint, bigint, bigint, boolean] | null;
  const referralBal = basic?.[1] ? formatUnits(basic[1], USDT_DECIMALS) : '0.00';

  // ========== Refresh All ==========
  const handleRefreshAll = async () => {
    setRefreshing(true);
    await Promise.all([refetchPlp(), refetchUsdt(), refetchReferral()]);
    setRefreshing(false);
  };

  // ========== Card configuration ==========
  const cards = [
    {
      key: 'plp',
      label: 'PLP',
      value: plpVal,
      sub: 'PolyGo Token',
      isLoading: plpLoading,
      isError: plpError,
      icon: (
        <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-indigo-500/30">
          PLP
        </span>
      ),
    },
    {
      key: 'usdt',
      label: 'USDT',
      value: usdtVal,
      sub: 'Tether USD',
      isLoading: usdtLoading,
      isError: usdtError,
      icon: (
        <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-emerald-500/30">
          $
        </span>
      ),
    },
    {
      key: 'referral',
      label: 'Referral',
      value: referralBal,
      sub: 'Earnings',
      isLoading: referralLoading,
      isError: referralError,
      icon: (
        <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold shadow-md shadow-purple-500/30">
          👥
        </span>
      ),
    },
  ];

  return (
    <div className="card p-5">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-slate-700">Your Balances</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">Live on-chain</span>
          <button
            onClick={handleRefreshAll}
            disabled={refreshing}
            className="text-slate-400 hover:text-indigo-600 transition disabled:opacity-50"
            title="Refresh all balances"
          >
            <svg
              className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {cards.map((card) => (
          <div
            key={card.key}
            className="bg-gradient-to-b from-indigo-50/60 to-white border border-indigo-50 rounded-xl p-4 relative overflow-hidden group hover:shadow-md hover:shadow-indigo-100 transition"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">{card.icon}</div>
              {card.isError && (
                <span className="text-[10px] text-rose-500" title="Error fetching balance">⚠️</span>
              )}
            </div>
            <p className="mt-3 text-[11px] font-medium text-slate-400">{card.label}</p>
            {card.isLoading ? (
              <div className="h-7 w-16 bg-slate-200 rounded animate-pulse mt-1"></div>
            ) : (
              <p className="text-lg font-bold text-slate-800 truncate">{card.value}</p>
            )}
            <p className="text-[10px] text-slate-400 mt-0.5">{card.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
};