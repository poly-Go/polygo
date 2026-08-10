import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, maxUint256, formatUnits } from 'viem';
import { CONTRACT_ADDRESS, PLP_ABI, USDT_DECIMALS, PLP_DECIMALS, PLP_ADDRESS, CHAIN_ID, USDT_ADDRESS } from '../../constants';
import { ERC20_ABI } from '../../abi/erc20Abi';
import { useToast } from '../../hooks/useToast';
import { validateBuy, validateSell, TRADE_LIMITS } from '../../utils/validation';

// ─── PREMIUM ICONS ───
const Icons = {
  buy: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  sell: (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
    </svg>
  ),
  wallet: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  info: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  arrowRight: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ),
  check: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  clock: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  sparkles: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  shield: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  list: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  lightning: (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
};

// ─── PREMIUM BUTTON ───
const PremiumButton = ({ onClick, children, variant = 'primary', disabled = false, className = '' }: any) => {
  const variants: Record<string, string> = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200',
    sell: 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-200',
    ghost: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200',
    chip: 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-200 hover:border-slate-300',
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

// ─── PREMIUM INPUT ───
const PremiumInput = ({ value, onChange, placeholder, suffix, disabled = false }: any) => (
  <div className="relative">
    <input
      type="number"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5 text-lg font-semibold text-slate-800 placeholder-slate-400 
        focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 
        transition-all duration-200 hover:border-slate-300 disabled:bg-slate-100 disabled:text-slate-400"
    />
    {suffix && (
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">{suffix}</span>
    )}
  </div>
);

// ─── INFO ROW ───
const InfoRow = ({ icon, text, highlight }: any) => (
  <div className="flex items-start gap-3 py-2">
    <div className="h-6 w-6 rounded-lg bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
      {icon}
    </div>
    <p className="text-sm text-slate-600 leading-relaxed">
      {highlight ? (
        <>
          {text.split(highlight)[0]}
          <span className="font-bold text-indigo-600">{highlight}</span>
          {text.split(highlight)[1]}
        </>
      ) : text}
    </p>
  </div>
);

// ═══════════════════════════════════════════════════════
// MAIN BUY SELL COMPONENT
// ═══════════════════════════════════════════════════════
export default function BuySell() {
  const { address, isConnected } = useAccount();
  const toast = useToast();
  const [buyAmount, setBuyAmount] = useState('');
  const [sellAmount, setSellAmount] = useState('');
  const [approving, setApproving] = useState(false);
  const [isBuying, setIsBuying] = useState(false);
  const [isSelling, setIsSelling] = useState(false);

  // ---------- Get contract addresses ----------
  const { data: usdtAddress } = useReadContract({
    chainId: CHAIN_ID,
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'USDT',
  });

  // ---------- Get PLP balance ----------
  const { data: plpBalance, refetch: refetchPlpBalance } = useReadContract({
    chainId: CHAIN_ID,
    address: PLP_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: !!address && isConnected },
  });

  // ---------- Get USDT balance (only refetch, no data needed) ----------
  const { refetch: refetchUsdtBalance } = useReadContract({
    chainId: CHAIN_ID,
    address: USDT_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: !!address && isConnected },
  });

  // ---------- Read on-chain limits (with constant fallback) ----------
  const { data: contractMinBuy } = useReadContract({
    chainId: CHAIN_ID,
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'minBuyAmount',
  });
  const { data: contractMaxBuy } = useReadContract({
    chainId: CHAIN_ID,
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'maxBuyAmount',
  });
  const { data: contractMinSell } = useReadContract({
    chainId: CHAIN_ID,
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'minSellAmount',
  });
  const { data: contractMaxSell } = useReadContract({
    chainId: CHAIN_ID,
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'maxSellAmount',
  });

  // Effective limits (on-chain if available, else constants)
  const buyMin = contractMinBuy ? Number(formatUnits(contractMinBuy as bigint, USDT_DECIMALS)) : TRADE_LIMITS.BUY.MIN;
  const buyMax = contractMaxBuy ? Number(formatUnits(contractMaxBuy as bigint, USDT_DECIMALS)) : TRADE_LIMITS.BUY.MAX;
  const sellMin = contractMinSell ? Number(formatUnits(contractMinSell as bigint, PLP_DECIMALS)) : TRADE_LIMITS.SELL.MIN;
  const sellMax = contractMaxSell ? Number(formatUnits(contractMaxSell as bigint, PLP_DECIMALS)) : TRADE_LIMITS.SELL.MAX;

  // ---------- Read allowances ----------
  const { data: usdtAllowance, refetch: refetchUsdtAllowance } = useReadContract({
    chainId: CHAIN_ID,
    address: usdtAddress as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address as `0x${string}`, CONTRACT_ADDRESS as `0x${string}`],
    query: { enabled: !!address && !!usdtAddress && isConnected },
  });

  const { data: plpAllowance, refetch: refetchPlpAllowance } = useReadContract({
    chainId: CHAIN_ID,
    address: PLP_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'allowance',
    args: [address as `0x${string}`, CONTRACT_ADDRESS as `0x${string}`],
    query: { enabled: !!address && isConnected },
  });

  // ---------- Write hooks ----------
  const { writeContract: writeUSDT, data: approveHash } = useWriteContract();
  const { isSuccess: approveSuccess } = useWaitForTransactionReceipt({ hash: approveHash });

  const { writeContract: writeBuy, data: buyHash, isPending: isBuyPending } = useWriteContract();
  const { isSuccess: buySuccess } = useWaitForTransactionReceipt({ hash: buyHash });

  const { writeContract: writeSell, data: sellHash, isPending: isSellPending } = useWriteContract();
  const { isSuccess: sellSuccess } = useWaitForTransactionReceipt({ hash: sellHash });

  // ---------- Derived values ----------
  const formattedPlpBalance = plpBalance
    ? Number(formatUnits(plpBalance as bigint, PLP_DECIMALS)).toFixed(2)
    : '0.00';

  const estimatedPlp = buyAmount
    ? (parseFloat(buyAmount) * 1000).toLocaleString()
    : '0';

  const bonusPlp = buyAmount && parseFloat(buyAmount) >= 10
    ? Math.floor(parseFloat(buyAmount) * 1000 * 0.01)
    : 0;

  // ---------- Validation (centralized) ----------
  const buyValidation = validateBuy(buyAmount, buyMin, buyMax);
  const sellValidation = validateSell(sellAmount, sellMin, sellMax, plpBalance as bigint, PLP_DECIMALS);
  const buyError = buyValidation.firstError;
  const sellError = sellValidation.firstError;

  // ---------- Handlers ----------
  const handleBuy = async () => {
    if (!address || !usdtAddress || !buyAmount) return;
    if (!buyValidation.isValid) {
      toast.error('Invalid Amount', buyValidation.firstError || 'Please enter a valid buy amount');
      return;
    }
    const amount = parseUnits(buyAmount, USDT_DECIMALS);
    setIsBuying(true);

    try {
      const allowance = usdtAllowance as bigint || 0n;
      if (allowance < amount) {
        setApproving(true);
        toast.buyApproval();
        await writeUSDT({
          chainId: CHAIN_ID,
          address: usdtAddress as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESS as `0x${string}`, maxUint256],
        });
      } else {
        toast.buyPending();
        writeBuy({
          chainId: CHAIN_ID,
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: PLP_ABI,
          functionName: 'buy',
          args: [amount],
        });
        setIsBuying(false);
      }
    } catch {
      toast.buyError();
      setApproving(false);
      setIsBuying(false);
    }
  };

  const handleSell = async () => {
    if (!address || !sellAmount) return;
    if (!sellValidation.isValid) {
      toast.error('Invalid Amount', sellValidation.firstError || 'Please enter a valid sell amount');
      return;
    }
    const amount = parseUnits(sellAmount, PLP_DECIMALS);
    setIsSelling(true);

    try {
      const allowance = plpAllowance as bigint || 0n;
      if (allowance < amount) {
        setApproving(true);
        toast.sellApproval();
        await writeUSDT({
          chainId: CHAIN_ID,
          address: PLP_ADDRESS as `0x${string}`,
          abi: ERC20_ABI,
          functionName: 'approve',
          args: [CONTRACT_ADDRESS as `0x${string}`, maxUint256],
        });
      } else {
        toast.sellPending();
        writeSell({
          chainId: CHAIN_ID,
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: PLP_ABI,
          functionName: 'sell',
          args: [amount],
        });
        setIsSelling(false);
      }
    } catch {
      toast.sellError();
      setApproving(false);
      setIsSelling(false);
    }
  };

  // ---------- Effects ----------
  useEffect(() => {
    if (approveSuccess) {
      refetchUsdtAllowance();
      refetchPlpAllowance();
    }
  }, [approveSuccess, refetchUsdtAllowance, refetchPlpAllowance]);

  // ✅ Buy Success - Targetted Refetch (NO useRefresh)
  useEffect(() => {
    if (buySuccess && address) {
      const refreshAfterBuy = async () => {
        await Promise.all([
          refetchPlpBalance(),
          refetchUsdtBalance(),
          refetchUsdtAllowance(),
          refetchPlpAllowance(),
        ]);
      };
      refreshAfterBuy();
      
      toast.buySuccess(buyAmount, 'PLP', bonusPlp);
      setBuyAmount('');
    }
  }, [buySuccess, buyAmount, address, toast, bonusPlp, 
      refetchPlpBalance, refetchUsdtBalance, refetchUsdtAllowance, refetchPlpAllowance]);

  // ✅ Sell Success - Targetted Refetch (NO useRefresh)
  useEffect(() => {
    if (sellSuccess && address) {
      const refreshAfterSell = async () => {
        await Promise.all([
          refetchPlpBalance(),
          refetchUsdtBalance(),
          refetchPlpAllowance(),
        ]);
      };
      refreshAfterSell();
      
      toast.sellSuccess(sellAmount);
      setSellAmount('');
    }
  }, [sellSuccess, sellAmount, address, toast, 
      refetchPlpBalance, refetchUsdtBalance, refetchPlpAllowance]);

  // ---------- Quick amount ----------
  const setBuyAmountQuick = (val: number) => setBuyAmount(val.toString());
  const setSellMax = () => {
    if (plpBalance) {
      setSellAmount(formatUnits(plpBalance as bigint, PLP_DECIMALS));
    }
  };

  // ═══════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════
  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-8">

      {/* ─── HEADER ─── */}
      <div className="text-center space-y-1">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Trade PLP</h1>
        <p className="text-sm text-slate-500">Buy and sell PLP tokens instantly</p>
      </div>

      {/* ─── TRADE CARDS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* ═══ BUY CARD ═══ */}
        <div className="relative overflow-hidden rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/60 to-white shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-400 via-blue-400 to-indigo-400" />

          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                {Icons.buy}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Buy PLP</h3>
                <p className="text-xs text-slate-500">Purchase with USDT</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">You Pay (USDT)</label>
              <PremiumInput
                value={buyAmount}
                onChange={(e: any) => setBuyAmount(e.target.value)}
                placeholder="0.00"
                suffix="USDT"
                disabled={isBuying || isBuyPending}
              />
              {buyAmount && buyError && (
                <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {buyError}
                </p>
              )}
              <p className="text-[11px] text-slate-400">
                Min <span className="font-semibold text-slate-500">{buyMin}</span> • Max <span className="font-semibold text-slate-500">{buyMax}</span> USDT
              </p>
            </div>

            <div className="flex flex-wrap gap-2 mt-3">
              {[10, 20, 50, 100].map(val => (
                <button
                  key={val}
                  onClick={() => setBuyAmountQuick(val)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 hover:scale-105 active:scale-95
                    ${buyAmount === val.toString()
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200'
                      : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300'
                    }`}
                >
                  {val} USDT
                </button>
              ))}
            </div>

            {buyAmount && parseFloat(buyAmount) > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-white border border-indigo-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-medium">You Receive</span>
                  <span className="text-sm font-bold text-slate-800">{estimatedPlp} PLP</span>
                </div>
                {parseFloat(buyAmount) >= 10 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      {Icons.sparkles} Bonus (1%)
                    </span>
                    <span className="text-sm font-bold text-emerald-600">+{bonusPlp.toLocaleString()} PLP</span>
                  </div>
                )}
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-medium">Rate</span>
                  <span className="text-xs font-semibold text-slate-700">1,000 PLP = 1 USDT</span>
                </div>
              </div>
            )}

            <PremiumButton
              onClick={handleBuy}
              disabled={approving || isBuyPending || isBuying || !buyValidation.isValid}
              variant="primary"
              className="w-full mt-4 py-3.5 text-base"
            >
              <span className="flex items-center justify-center gap-2">
                {approving && isBuying ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Approving USDT...
                  </>
                ) : isBuyPending || isBuying ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {Icons.buy} Buy PLP
                  </>
                )}
              </span>
            </PremiumButton>
          </div>
        </div>

        {/* ═══ SELL CARD ═══ */}
        <div className="relative overflow-hidden rounded-2xl border border-purple-200 bg-gradient-to-br from-purple-50/60 to-white shadow-sm transition-all duration-300 hover:shadow-md">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-purple-400" />

          <div className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white shadow-lg shadow-purple-200">
                {Icons.sell}
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800 tracking-tight">Sell PLP</h3>
                <p className="text-xs text-slate-500">Sell for USDT</p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">You Sell (PLP)</label>
              <PremiumInput
                value={sellAmount}
                onChange={(e: any) => setSellAmount(e.target.value)}
                placeholder="0.00"
                suffix="PLP"
                disabled={isSelling || isSellPending}
              />
              {sellAmount && sellError && (
                <p className="text-xs font-medium text-rose-600 flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {sellError}
                </p>
              )}
              <p className="text-[11px] text-slate-400">
                Min <span className="font-semibold text-slate-500">{sellMin.toLocaleString()}</span> • Max <span className="font-semibold text-slate-500">{sellMax.toLocaleString()}</span> PLP
              </p>
            </div>

            <div className="flex items-center justify-between mt-3">
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                {Icons.wallet}
                <span>Balance: <span className="font-semibold text-slate-700">{formattedPlpBalance} PLP</span></span>
              </div>
              <button
                onClick={setSellMax}
                className="px-3 py-1 rounded-lg text-xs font-semibold bg-purple-100 text-purple-700 border border-purple-200 hover:bg-purple-200 transition-all hover:scale-105 active:scale-95"
              >
                Max
              </button>
            </div>

            {sellAmount && parseFloat(sellAmount) > 0 && (
              <div className="mt-4 p-4 rounded-xl bg-white border border-purple-100 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-medium">You Receive (approx)</span>
                  <span className="text-sm font-bold text-slate-800">
                    {(parseFloat(sellAmount) / 1000).toFixed(4)} USDT
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                    {Icons.clock} Settlement Time
                  </span>
                  <span className="text-xs font-semibold text-slate-700">12 Hours</span>
                </div>
                <div className="h-px bg-slate-100" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500 font-medium">Rate</span>
                  <span className="text-xs font-semibold text-slate-700">1,000 PLP = 1 USDT</span>
                </div>
              </div>
            )}

            <PremiumButton
              onClick={handleSell}
              disabled={approving || isSellPending || isSelling || !sellValidation.isValid}
              variant="sell"
              className="w-full mt-4 py-3.5 text-base"
            >
              <span className="flex items-center justify-center gap-2">
                {approving && isSelling ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Approving PLP...
                  </>
                ) : isSellPending || isSelling ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    {Icons.sell} Sell PLP
                  </>
                )}
              </span>
            </PremiumButton>
          </div>
        </div>
      </div>

      {/* ─── HOW IT WORKS ─── */}
      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-300" />
        <div className="p-6">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="h-8 w-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center">
              {Icons.info}
            </div>
            <h3 className="text-base font-bold text-slate-800 tracking-tight">How It Works</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6">
            <InfoRow
              icon={Icons.buy}
              text="Enter USDT amount and click Buy. You get an instant 1% bonus on purchases of 10 USDT or more."
              highlight="1% bonus"
            />
            <InfoRow
              icon={Icons.sparkles}
              text="The contract mints PLP at a rate of 1,000 PLP per 1 USDT. Bonus is added automatically."
              highlight="1,000 PLP per 1 USDT"
            />
            <InfoRow
              icon={Icons.sell}
              text="Enter PLP amount and click Sell. Your order enters a queue and settles after the waiting period."
              highlight="12 hours"
            />
            <InfoRow
              icon={Icons.shield}
              text="First-time approval is unlimited — you won't need to approve again for future trades."
              highlight="unlimited"
            />
            <InfoRow
              icon={Icons.list}
              text="After selling, claim your USDT from the Orders tab once settlement is complete."
            />
            <InfoRow
              icon={Icons.lightning}
              text="Use quick-amount buttons for convenience. The Max button fills your entire PLP balance."
            />
          </div>
        </div>
      </div>
    </div>
  );
}