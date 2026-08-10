import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, PLP_ABI, USDT_DECIMALS, CHAIN_ID } from '../../constants';
import { useState, useEffect } from 'react';
import { parseUnits, formatUnits } from 'viem';
import { useToast } from '../../hooks/useToast';

// ─── PREMIUM ICONS ───
const Icons = {
  refresh: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
  shield: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  wallet: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  users: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  queue: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  debt: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  clock: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  settings: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  pause: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  play: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  arrowUp: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
    </svg>
  ),
  lock: (
    <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  emergency: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  transfer: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
  ),
};

// ─── STAT CARD COMPONENT ───
const StatCard = ({ icon, label, value, subValue, color }: any) => {
  const colorMap: Record<string, { bg: string; border: string; text: string; iconBg: string; iconColor: string; valueColor: string }> = {
    indigo: {
      bg: 'bg-indigo-50/80',
      border: 'border-indigo-200',
      text: 'text-indigo-600',
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      valueColor: 'text-indigo-700',
    },
    purple: {
      bg: 'bg-purple-50/80',
      border: 'border-purple-200',
      text: 'text-purple-600',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      valueColor: 'text-purple-700',
    },
    emerald: {
      bg: 'bg-emerald-50/80',
      border: 'border-emerald-200',
      text: 'text-emerald-600',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      valueColor: 'text-emerald-700',
    },
    amber: {
      bg: 'bg-amber-50/80',
      border: 'border-amber-200',
      text: 'text-amber-600',
      iconBg: 'bg-amber-100',
      iconColor: 'text-amber-600',
      valueColor: 'text-amber-700',
    },
    rose: {
      bg: 'bg-rose-50/80',
      border: 'border-rose-200',
      text: 'text-rose-600',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-600',
      valueColor: 'text-rose-700',
    },
    blue: {
      bg: 'bg-blue-50/80',
      border: 'border-blue-200',
      text: 'text-blue-600',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      valueColor: 'text-blue-700',
    },
    cyan: {
      bg: 'bg-cyan-50/80',
      border: 'border-cyan-200',
      text: 'text-cyan-600',
      iconBg: 'bg-cyan-100',
      iconColor: 'text-cyan-600',
      valueColor: 'text-cyan-700',
    },
  };

  const c = colorMap[color] || colorMap.indigo;

  return (
    <div className={`relative overflow-hidden rounded-2xl border ${c.border} ${c.bg} backdrop-blur-sm p-5 shadow-sm transition-all duration-300 hover:shadow-md hover:scale-[1.01]`}>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-3">
          <div className={`h-10 w-10 rounded-xl ${c.iconBg} ${c.iconColor} flex items-center justify-center`}>
            {icon}
          </div>
          {subValue && (
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{subValue}</span>
          )}
        </div>
        <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider">{label}</p>
        <p className={`text-2xl font-bold ${c.valueColor} mt-1 tracking-tight`}>{value}</p>
      </div>
    </div>
  );
};

// ─── SECTION CARD COMPONENT ───
const SectionCard = ({ title, icon, children, className = '', danger = false }: any) => (
  <div className={`relative overflow-hidden rounded-2xl border ${danger ? 'border-rose-200' : 'border-slate-200'} bg-white shadow-sm transition-all duration-300 hover:shadow-md ${className}`}>
    <div className={`absolute top-0 left-0 right-0 h-[3px] ${danger ? 'bg-gradient-to-r from-rose-400 via-rose-300 to-rose-400' : 'bg-gradient-to-r from-indigo-400 via-purple-300 to-indigo-400'}`} />
    <div className="p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className={`h-9 w-9 rounded-lg ${danger ? 'bg-rose-100 text-rose-600' : 'bg-indigo-100 text-indigo-600'} flex items-center justify-center`}>
          {icon}
        </div>
        <h3 className="text-lg font-bold text-slate-800 tracking-tight">{title}</h3>
      </div>
      {children}
    </div>
  </div>
);

// ─── PREMIUM INPUT ───
const PremiumInput = ({ placeholder, value, onChange, type = 'text', suffix }: any) => (
  <div className="relative">
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder-slate-400 
        focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 
        transition-all duration-200 hover:border-slate-300"
    />
    {suffix && (
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">{suffix}</span>
    )}
  </div>
);

// ─── PREMIUM BUTTON ───
const PremiumButton = ({ onClick, children, variant = 'primary', disabled = false, className = '' }: any) => {
  const variants: Record<string, string> = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-200',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-200',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-200',
    ghost: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`relative overflow-hidden px-5 py-2.5 rounded-xl text-sm font-semibold tracking-tight
        transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
};

// ═══════════════════════════════════════════════════════
// MAIN ADMIN PANEL
// ═══════════════════════════════════════════════════════
export default function AdminPanel() {
  const { address, isConnected } = useAccount();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // ─── READ CONTRACTS ───
  const { data: owner, isLoading: ownerLoading, refetch: refetchOwner } = useReadContract({
    chainId: CHAIN_ID,
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'owner',
    query: { enabled: isConnected },
  });

  const { data: poolInfo, refetch: refetchPoolInfo, isLoading: poolInfoLoading } = useReadContract({
    chainId: CHAIN_ID,
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'getPoolInfo',
    query: { enabled: isConnected },
  });

  const { data: adminFeePercent, refetch: refetchAdminFee } = useReadContract({
    chainId: CHAIN_ID, address: CONTRACT_ADDRESS as `0x${string}`, abi: PLP_ABI,
    functionName: 'adminFeePercent', query: { enabled: isConnected },
  });

  const { data: referralPercent, refetch: refetchReferralFee } = useReadContract({
    chainId: CHAIN_ID, address: CONTRACT_ADDRESS as `0x${string}`, abi: PLP_ABI,
    functionName: 'referralPercent', query: { enabled: isConnected },
  });

  const { data: claimFeePercent, refetch: refetchClaimFee } = useReadContract({
    chainId: CHAIN_ID, address: CONTRACT_ADDRESS as `0x${string}`, abi: PLP_ABI,
    functionName: 'claimFeePercent', query: { enabled: isConnected },
  });

// ✅ CORRECT: MIN_SELL is a constant (not a function)
  const { refetch: refetchMinSell } = useReadContract({
    chainId: CHAIN_ID, address: CONTRACT_ADDRESS as `0x${string}`, abi: PLP_ABI,
    functionName: 'MIN_SELL', query: { enabled: isConnected },
  });

  // ✅ CORRECT: MAX_CLAIM_AMOUNT is a constant
  const { data: maxClaimAmount, refetch: refetchMaxClaim } = useReadContract({
    chainId: CHAIN_ID, address: CONTRACT_ADDRESS as `0x${string}`, abi: PLP_ABI,
    functionName: 'MAX_CLAIM_AMOUNT', query: { enabled: isConnected },
  });

// ✅ CORRECT: sellWaitTime is a state variable
  const { refetch: refetchSellWaitTime } = useReadContract({
    chainId: CHAIN_ID, address: CONTRACT_ADDRESS as `0x${string}`, abi: PLP_ABI,
    functionName: 'sellWaitTime', query: { enabled: isConnected },
  });

  // ✅ ADD: Read minBuyAmount and maxBuyAmount
  const { data: minBuyAmount, refetch: refetchMinBuy } = useReadContract({
    chainId: CHAIN_ID, address: CONTRACT_ADDRESS as `0x${string}`, abi: PLP_ABI,
    functionName: 'minBuyAmount', query: { enabled: isConnected },
  });

  const { data: maxBuyAmount, refetch: refetchMaxBuy } = useReadContract({
    chainId: CHAIN_ID, address: CONTRACT_ADDRESS as `0x${string}`, abi: PLP_ABI,
    functionName: 'maxBuyAmount', query: { enabled: isConnected },
  });

  // ✅ ADD: Read minSellAmount and maxSellAmount
  const { data: minSellAmount, refetch: refetchMinSellAmount } = useReadContract({
    chainId: CHAIN_ID, address: CONTRACT_ADDRESS as `0x${string}`, abi: PLP_ABI,
    functionName: 'minSellAmount', query: { enabled: isConnected },
  });

  const { data: maxSellAmount, refetch: refetchMaxSellAmount } = useReadContract({
    chainId: CHAIN_ID, address: CONTRACT_ADDRESS as `0x${string}`, abi: PLP_ABI,
    functionName: 'maxSellAmount', query: { enabled: isConnected },
  });

  // ✅ ADD: Read paused state
  const { data: paused, refetch: refetchPaused } = useReadContract({
    chainId: CHAIN_ID, address: CONTRACT_ADDRESS as `0x${string}`, abi: PLP_ABI,
    functionName: 'paused', query: { enabled: isConnected },
  });

  // ─── EXTRACT POOL DATA ───
  const pool = (poolInfo ?? null) as readonly [bigint, bigint, bigint, bigint, bigint, bigint, bigint] | null;
  const queuePool = pool?.[0] || 0n;
  const adminPool = pool?.[1] || 0n;
  const referralPool = pool?.[2] || 0n;
  const pendingOrders = pool?.[4] ? Number(pool[4]) : 0;
  const currentSettleTime = pool?.[5] ? Number(pool[5]) : 0;
  const totalPendingDebt = pool?.[6] || 0n;

  const adminPoolFormatted = Number(formatUnits(adminPool, USDT_DECIMALS)).toFixed(2);
  const referralPoolFormatted = Number(formatUnits(referralPool, USDT_DECIMALS)).toFixed(2);
  const queuePoolFormatted = Number(formatUnits(queuePool, USDT_DECIMALS)).toFixed(2);
  const totalPendingDebtFormatted = Number(formatUnits(totalPendingDebt, USDT_DECIMALS)).toFixed(2);

  const isOwner = isConnected && owner && address && address.toLowerCase() === (owner as string).toLowerCase();

  // ─── WRITE CONTRACT ───
  const { writeContract, data: writeHash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash: writeHash });

  // ─── FORM STATES ───
  const [feeAdmin, setFeeAdmin] = useState('');
  const [feeReferral, setFeeReferral] = useState('');
  const [feeClaim, setFeeClaim] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [minSellInput, setMinSellInput] = useState('');
  const [maxSellInput, setMaxSellInput] = useState('');
  const [minBuyInput, setMinBuyInput] = useState('');
  const [maxBuyInput, setMaxBuyInput] = useState('');
  const [maxClaimInput, setMaxClaimInput] = useState('');
  const [settleTimeInput, setSettleTimeInput] = useState('');
  const [emergencyMintAddress, setEmergencyMintAddress] = useState('');
  const [emergencyMintAmount, setEmergencyMintAmount] = useState('');
  const [emergencyWithdrawAddress, setEmergencyWithdrawAddress] = useState('');
  const [emergencyWithdrawAmount, setEmergencyWithdrawAmount] = useState('');
  const [newOwnerAddress, setNewOwnerAddress] = useState('');

  // ─── HANDLERS ───

  // 1. Update Fees
  const handleUpdateFees = () => {
    const admin = parseInt(feeAdmin);
    const ref = parseInt(feeReferral);
    const claim = parseInt(feeClaim);
    if (isNaN(admin) || isNaN(ref) || isNaN(claim)) {
      toast.error('Invalid Input', 'Please enter valid numbers');
      return;
    }
    writeContract({
      chainId: CHAIN_ID,
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PLP_ABI,
      functionName: 'updateFees',
      args: [BigInt(admin), BigInt(ref), BigInt(claim)],
    });
  };

  // 2. Withdraw from Admin Pool
  const handleWithdraw = () => {
    if (!withdrawAmount) return;
    const amount = parseUnits(withdrawAmount, USDT_DECIMALS);
    writeContract({
      chainId: CHAIN_ID,
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PLP_ABI,
      functionName: 'withdrawAdminPartial',
      args: [amount],
    });
  };

  // 3. Update Sell Limits (minSellAmount + maxSellAmount)
  const handleUpdateSellLimits = () => {
    if (!minSellInput || !maxSellInput) return;
    const min = parseUnits(minSellInput, 18);
    const max = parseUnits(maxSellInput, 18);
    if (min >= max) {
      toast.error('Invalid Limits', 'Min sell must be less than max sell');
      return;
    }
    writeContract({
      chainId: CHAIN_ID,
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PLP_ABI,
      functionName: 'updateSellLimits',
      args: [min, max],
    });
  };

  // 4. Update Buy Limits (minBuyAmount + maxBuyAmount)
  const handleUpdateBuyLimits = () => {
    if (!minBuyInput || !maxBuyInput) return;
    const min = parseUnits(minBuyInput, USDT_DECIMALS);
    const max = parseUnits(maxBuyInput, USDT_DECIMALS);
    if (min >= max) {
      toast.error('Invalid Limits', 'Min buy must be less than max buy');
      return;
    }
    writeContract({
      chainId: CHAIN_ID,
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PLP_ABI,
      functionName: 'updateBuyLimits',
      args: [min, max],
    });
  };

  // 5. Update Max Claim Amount
  const handleUpdateMaxClaim = () => {
    if (!maxClaimInput) return;
    const amount = parseUnits(maxClaimInput, USDT_DECIMALS);
    writeContract({
      chainId: CHAIN_ID,
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PLP_ABI,
      functionName: 'updateMaxClaimAmount', // ✅ This is a function
      args: [amount],
    });
  };

  // 6. Update Settlement Wait Time
  const handleUpdateSettleTime = () => {
    if (!settleTimeInput) return;
    const time = parseInt(settleTimeInput);
    if (isNaN(time) || time < 60) {
      toast.error('Invalid Time', 'Minimum wait time is 60 seconds');
      return;
    }
    writeContract({
      chainId: CHAIN_ID,
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PLP_ABI,
      functionName: 'updateSettlementWaitTime',
      args: [BigInt(time)],
    });
  };

  // 7. Emergency Mint PLP
  const handleEmergencyMint = () => {
    if (!emergencyMintAddress || !emergencyMintAmount) return;
    const amount = parseUnits(emergencyMintAmount, 18);
    writeContract({
      chainId: CHAIN_ID,
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PLP_ABI,
      functionName: 'emergencyMintPGN',
      args: [emergencyMintAddress as `0x${string}`, amount],
    });
  };

  // 8. Emergency Withdraw (any token)
  const handleEmergencyWithdraw = () => {
    if (!emergencyWithdrawAddress || !emergencyWithdrawAmount) return;
    const amount = parseUnits(emergencyWithdrawAmount, 18);
    writeContract({
      chainId: CHAIN_ID,
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PLP_ABI,
      functionName: 'emergencyWithdraw',
      args: [emergencyWithdrawAddress as `0x${string}`, amount],
    });
  };

  // 9. Transfer Ownership
  const handleTransferOwnership = () => {
    if (!newOwnerAddress) return;
    writeContract({
      chainId: CHAIN_ID,
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PLP_ABI,
      functionName: 'transferOwnership',
      args: [newOwnerAddress as `0x${string}`],
    });
  };

  // 10. Pause
  const handlePause = () => {
    writeContract({
      chainId: CHAIN_ID,
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PLP_ABI,
      functionName: 'pause',
      args: [],
    });
  };

  // 11. Unpause
  const handleUnpause = () => {
    writeContract({
      chainId: CHAIN_ID,
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PLP_ABI,
      functionName: 'unpause',
      args: [],
    });
  };

  // ─── REFRESH ───
  const handleRefresh = async () => {
    setLoading(true);
    try {
      await Promise.all([
        refetchPoolInfo(), refetchAdminFee(), refetchReferralFee(),
        refetchClaimFee(), refetchMinSell(), refetchMaxClaim(),
        refetchSellWaitTime(), refetchOwner(), refetchMinBuy(),
        refetchMaxBuy(), refetchMinSellAmount(), refetchMaxSellAmount(),
        refetchPaused(),
      ]);
      toast.refresh();
    } catch {
      toast.generalError();
    } finally {
      setLoading(false);
    }
  };

  // ─── EFFECTS ───
  useEffect(() => {
    if (isSuccess) {
      toast.adminFeesUpdated();
      handleRefresh();
    }
  }, [isSuccess]);

  // ─── FORMAT HELPERS ───
const formatPLP = (val: unknown) => {
    if (!val) return '...';
    return Number(formatUnits(val as bigint, 18)).toLocaleString();
  };

  const formatUSDT = (val: unknown) => {
    if (!val) return '...';
    return Number(formatUnits(val as bigint, USDT_DECIMALS)).toLocaleString();
  };

  // ═══════════════════════════════════════════════════════
  // RENDER STATES
  // ═══════════════════════════════════════════════════════

  if (!isConnected) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-16 w-16 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
            {Icons.wallet}
          </div>
          <h2 className="text-xl font-bold text-slate-800">Wallet Not Connected</h2>
          <p className="text-sm text-slate-500">Please connect your wallet to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (ownerLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center shadow-sm">
          <div className="h-16 w-16 rounded-2xl bg-amber-100 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 mb-4">
            {Icons.lock}
          </div>
          <h2 className="text-xl font-bold text-amber-700 mb-2">Admin Access Restricted</h2>
          <p className="text-sm text-slate-600 mb-6">Only the contract owner can access admin functions.</p>

          <div className="space-y-2 text-xs text-slate-500 bg-white rounded-xl p-4 border border-slate-100">
            <div className="flex justify-between">
              <span>Your Address</span>
              <span className="font-mono text-slate-700">{address?.slice(0, 6)}...{address?.slice(-4)}</span>
            </div>
            <div className="flex justify-between">
              <span>Contract Owner</span>
              <span className="font-mono text-slate-700">{(owner as string)?.slice(0, 6)}...{(owner as string)?.slice(-4)}</span>
            </div>
          </div>

          <PremiumButton onClick={handleRefresh} variant="ghost" className="mt-6 w-full">
            {Icons.refresh} <span className="ml-2">Refresh</span>
          </PremiumButton>
        </div>
      </div>
    );
  }

  const isLoading = poolInfoLoading || loading;

  // ═══════════════════════════════════════════════════════
  // MAIN RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">

      {/* ─── HEADER ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
            {Icons.shield}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Admin Panel</h1>
            <p className="text-xs text-slate-500 font-medium">Contract Owner Dashboard</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className={`text-xs font-medium px-3 py-1 rounded-full ${paused ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'}`}>
            {paused ? '⏸️ Paused' : '▶️ Active'}
          </span>
          <PremiumButton onClick={handleRefresh} disabled={loading} variant="ghost" className="self-start sm:self-auto">
            <span className={`${loading ? 'animate-spin' : ''} mr-2`}>{Icons.refresh}</span>
            {loading ? 'Syncing...' : 'Refresh Data'}
          </PremiumButton>
        </div>
      </div>

      {/* ─── STATS GRID ─── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Icons.wallet}
          label="Admin Pool"
          value={`${isLoading ? '...' : adminPoolFormatted} USDT`}
          color="indigo"
        />
        <StatCard
          icon={Icons.users}
          label="Referral Pool"
          value={`${isLoading ? '...' : referralPoolFormatted} USDT`}
          color="purple"
        />
        <StatCard
          icon={Icons.queue}
          label="Queue Pool"
          value={`${isLoading ? '...' : queuePoolFormatted} USDT`}
          color="emerald"
        />
        <StatCard
          icon={Icons.clock}
          label="Pending Orders"
          value={isLoading ? '...' : pendingOrders}
          subValue={`${currentSettleTime / 60} min settle`}
          color="amber"
        />
      </div>

      {/* ─── SECONDARY STATS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          icon={Icons.debt}
          label="Total Pending Debt"
          value={`${isLoading ? '...' : totalPendingDebtFormatted} USDT`}
          color="rose"
        />
        <StatCard
          icon={Icons.settings}
          label="Current Fees"
          value={`${adminFeePercent?.toString() || '...'}%`}
          subValue={`Ref: ${referralPercent?.toString() || '...'}% | Claim: ${claimFeePercent?.toString() || '...'}%`}
          color="blue"
        />
        <StatCard
          icon={Icons.clock}
          label="Settlement Time"
          value={`${currentSettleTime / 60} min`}
          subValue={`${currentSettleTime} seconds`}
          color="cyan"
        />
      </div>

      {/* ─── UPDATE FEES ─── */}
      <SectionCard title="Update Protocol Fees" icon={Icons.settings}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Fee</label>
            <PremiumInput
              placeholder="e.g. 50"
              value={feeAdmin}
              onChange={(e: any) => setFeeAdmin(e.target.value)}
              suffix="bps"
            />
            <p className="text-[10px] text-slate-400 font-medium">Basis points (max 50)</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Referral Fee</label>
            <PremiumInput
              placeholder="e.g. 200"
              value={feeReferral}
              onChange={(e: any) => setFeeReferral(e.target.value)}
              suffix="bps"
            />
            <p className="text-[10px] text-slate-400 font-medium">Basis points (max 200)</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Claim Fee</label>
            <PremiumInput
              placeholder="e.g. 1000"
              value={feeClaim}
              onChange={(e: any) => setFeeClaim(e.target.value)}
              suffix="bps"
            />
            <p className="text-[10px] text-slate-400 font-medium">Basis points (max 1000)</p>
          </div>
        </div>
        <div className="mt-5">
          <PremiumButton onClick={handleUpdateFees} disabled={isPending}>
            {isPending ? 'Updating...' : 'Update Fees'}
          </PremiumButton>
        </div>
      </SectionCard>

      {/* ─── WITHDRAW ─── */}
      <SectionCard title="Withdraw from Admin Pool" icon={Icons.arrowUp}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</label>
            <PremiumInput
              placeholder="Enter USDT amount"
              value={withdrawAmount}
              onChange={(e: any) => setWithdrawAmount(e.target.value)}
              suffix="USDT"
            />
            <p className="text-[10px] text-slate-400 font-medium">Available: {adminPoolFormatted} USDT</p>
          </div>
          <div className="flex items-end">
            <PremiumButton onClick={handleWithdraw} disabled={isPending}>
              {isPending ? 'Withdrawing...' : 'Withdraw'}
            </PremiumButton>
          </div>
        </div>
      </SectionCard>

      {/* ─── BUY LIMITS ─── */}
      <SectionCard title="Update Buy Limits" icon={Icons.settings}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Min Buy</label>
            <PremiumInput
              placeholder="Enter min USDT"
              value={minBuyInput}
              onChange={(e: any) => setMinBuyInput(e.target.value)}
              suffix="USDT"
            />
            <p className="text-[10px] text-slate-400 font-medium">Current: {formatUSDT(minBuyAmount)} USDT</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Buy</label>
            <PremiumInput
              placeholder="Enter max USDT"
              value={maxBuyInput}
              onChange={(e: any) => setMaxBuyInput(e.target.value)}
              suffix="USDT"
            />
            <p className="text-[10px] text-slate-400 font-medium">Current: {formatUSDT(maxBuyAmount)} USDT</p>
          </div>
        </div>
        <div className="mt-5">
          <PremiumButton onClick={handleUpdateBuyLimits} disabled={isPending}>
            {isPending ? 'Updating...' : 'Update Buy Limits'}
          </PremiumButton>
        </div>
      </SectionCard>

      {/* ─── SELL LIMITS ─── */}
      <SectionCard title="Update Sell Limits" icon={Icons.settings}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Min Sell</label>
            <PremiumInput
              placeholder="Enter min PLP"
              value={minSellInput}
              onChange={(e: any) => setMinSellInput(e.target.value)}
              suffix="PLP"
            />
            <p className="text-[10px] text-slate-400 font-medium">Current: {formatPLP(minSellAmount)} PLP</p>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Sell</label>
            <PremiumInput
              placeholder="Enter max PLP"
              value={maxSellInput}
              onChange={(e: any) => setMaxSellInput(e.target.value)}
              suffix="PLP"
            />
            <p className="text-[10px] text-slate-400 font-medium">Current: {formatPLP(maxSellAmount)} PLP</p>
          </div>
        </div>
        <div className="mt-5">
          <PremiumButton onClick={handleUpdateSellLimits} disabled={isPending}>
            {isPending ? 'Updating...' : 'Update Sell Limits'}
          </PremiumButton>
        </div>
      </SectionCard>

      {/* ─── MAX CLAIM ─── */}
      <SectionCard title="Update Max Claim Amount" icon={Icons.settings}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Claim</label>
            <PremiumInput
              placeholder="Enter USDT amount"
              value={maxClaimInput}
              onChange={(e: any) => setMaxClaimInput(e.target.value)}
              suffix="USDT"
            />
            <p className="text-[10px] text-slate-400 font-medium">
              Current: {formatUSDT(maxClaimAmount)} USDT
            </p>
          </div>
          <div className="flex items-end">
            <PremiumButton onClick={handleUpdateMaxClaim} disabled={isPending}>
              {isPending ? 'Updating...' : 'Update Max Claim'}
            </PremiumButton>
          </div>
        </div>
      </SectionCard>

      {/* ─── SETTLEMENT TIME ─── */}
      <SectionCard title="Update Settlement Wait Time" icon={Icons.clock}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Wait Time (seconds)</label>
            <PremiumInput
              placeholder="Minimum 60 seconds"
              value={settleTimeInput}
              onChange={(e: any) => setSettleTimeInput(e.target.value)}
              suffix="sec"
            />
            <p className="text-[10px] text-slate-400 font-medium">
              Current: {currentSettleTime / 60} minutes ({currentSettleTime} seconds)
            </p>
          </div>
          <div className="flex items-end">
            <PremiumButton onClick={handleUpdateSettleTime} disabled={isPending}>
              {isPending ? 'Updating...' : 'Update Time'}
            </PremiumButton>
          </div>
        </div>
      </SectionCard>

      {/* ─── EMERGENCY CONTROLS ─── */}
      <SectionCard title="Emergency Controls" icon={Icons.shield} danger>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 p-4 rounded-xl bg-rose-50 border border-rose-100">
            <p className="text-sm font-bold text-rose-700 mb-1">Pause Contract</p>
            <p className="text-xs text-slate-500 mb-3">Temporarily disable all contract functions.</p>
            <PremiumButton onClick={handlePause} disabled={isPending} variant="danger">
              <span className="flex items-center gap-2">
                {Icons.pause}
                Pause Contract
              </span>
            </PremiumButton>
          </div>
          <div className="flex-1 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
            <p className="text-sm font-bold text-emerald-700 mb-1">Unpause Contract</p>
            <p className="text-xs text-slate-500 mb-3">Resume all contract functions.</p>
            <PremiumButton onClick={handleUnpause} disabled={isPending} variant="success">
              <span className="flex items-center gap-2">
                {Icons.play}
                Unpause Contract
              </span>
            </PremiumButton>
          </div>
        </div>
      </SectionCard>

      {/* ─── EMERGENCY MINT ─── */}
      <SectionCard title="Emergency Mint PLP" icon={Icons.emergency} danger>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recipient Address</label>
            <PremiumInput
              placeholder="0x..."
              value={emergencyMintAddress}
              onChange={(e: any) => setEmergencyMintAddress(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount (PLP)</label>
            <PremiumInput
              placeholder="Enter PLP amount"
              value={emergencyMintAmount}
              onChange={(e: any) => setEmergencyMintAmount(e.target.value)}
              suffix="PLP"
            />
          </div>
        </div>
        <div className="mt-5">
          <PremiumButton onClick={handleEmergencyMint} disabled={isPending} variant="danger">
            {isPending ? 'Minting...' : 'Emergency Mint'}
          </PremiumButton>
        </div>
      </SectionCard>

      {/* ─── EMERGENCY WITHDRAW ─── */}
      <SectionCard title="Emergency Withdraw (Any Token)" icon={Icons.emergency} danger>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Token Address</label>
            <PremiumInput
              placeholder="0x..."
              value={emergencyWithdrawAddress}
              onChange={(e: any) => setEmergencyWithdrawAddress(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount</label>
            <PremiumInput
              placeholder="Enter amount"
              value={emergencyWithdrawAmount}
              onChange={(e: any) => setEmergencyWithdrawAmount(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-5">
          <PremiumButton onClick={handleEmergencyWithdraw} disabled={isPending} variant="danger">
            {isPending ? 'Withdrawing...' : 'Emergency Withdraw'}
          </PremiumButton>
        </div>
      </SectionCard>

      {/* ─── TRANSFER OWNERSHIP ─── */}
      <SectionCard title="Transfer Ownership" icon={Icons.transfer}>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">New Owner Address</label>
            <PremiumInput
              placeholder="0x..."
              value={newOwnerAddress}
              onChange={(e: any) => setNewOwnerAddress(e.target.value)}
            />
            <p className="text-[10px] text-amber-600 font-medium">⚠️ This action is irreversible!</p>
          </div>
          <div className="flex items-end">
            <PremiumButton onClick={handleTransferOwnership} disabled={isPending} variant="danger">
              {isPending ? 'Transferring...' : 'Transfer Ownership'}
            </PremiumButton>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}