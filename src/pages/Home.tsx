import { useAccount, useDisconnect, useReadContract, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from 'wagmi';
import { useAppKit } from '@reown/appkit/react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { formatUnits, zeroAddress, isAddress } from 'viem';
import { CONTRACT_ADDRESS, PLP_ABI, USDT_DECIMALS, USDT_ADDRESS, PLP_ADDRESS, CHAIN_ID, PLP_DECIMALS } from '../constants';
import { ERC20_ABI } from '../abi/erc20Abi';
import { useToast } from '../hooks/useToast';
import { useState, useEffect, useCallback, useRef } from 'react';

export default function Home() {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { disconnect } = useDisconnect();
  const { open } = useAppKit();
  const navigate = useNavigate();
  const toast = useToast();
  const [registering, setRegistering] = useState(false);
  const { switchChain } = useSwitchChain();
  const [searchParams] = useSearchParams();
  const refAddress = searchParams.get('ref');
  const isValidRef = refAddress && isAddress(refAddress);
  
  // ✅ Prevent multiple refresh calls
  const refreshInProgress = useRef(false);
  const initialLoadDone = useRef(false);

  // ====== Balances ======
  const { data: plpRaw, refetch: refetchPlpBalance, isLoading: plpLoading } = useReadContract({
    chainId: CHAIN_ID,
    address: PLP_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  });

  const { data: usdtRaw, refetch: refetchUsdtBalance, isLoading: usdtLoading } = useReadContract({
    chainId: CHAIN_ID,
    address: USDT_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  });

  const plpBal = plpRaw ? Number(formatUnits(plpRaw as bigint, PLP_DECIMALS)).toFixed(2) : '0.00';
  const usdtBal = usdtRaw ? Number(formatUnits(usdtRaw as bigint, USDT_DECIMALS)).toFixed(2) : '0.00';

  // ====== User Info ======
  const { data: userBasic, refetch: refetchUserBasic, isLoading: basicLoading } = useReadContract({
    chainId: CHAIN_ID,
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'getUserBasicInfo',
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  });

  const { refetch: refetchExtended } = useReadContract({
    chainId: CHAIN_ID,
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'getUserExtendedInfo',
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  });

  const { data: pendingSettlement, refetch: refetchPending } = useReadContract({
    chainId: CHAIN_ID,
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'pendingSettlement',
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  });

  // ====== Registration ======
  const {
    data: registerHash,
    writeContract: writeRegister,
    isPending: isRegisterPending,
    isError: isRegisterError,
    error: registerError,
  } = useWriteContract();

  const { isSuccess: registerSuccess } = useWaitForTransactionReceipt({ hash: registerHash });

  // ====== Extract Values ======
  const userBasicTuple = (userBasic ?? null) as readonly [bigint, bigint, bigint, bigint, bigint, bigint, boolean] | null;
  const directCount = userBasicTuple?.[4] ? Number(userBasicTuple[4]) : 0;
  const activeDirects = userBasicTuple?.[5] ? Number(userBasicTuple[5]) : 0;
  const isActiveUser = (userBasicTuple?.[6] as boolean) || false;
  const referralBalance = userBasicTuple?.[1] ? formatUnits(userBasicTuple[1] as bigint, USDT_DECIMALS) : '0.00';

  const pendingUSDT = pendingSettlement ? formatUnits(pendingSettlement as bigint, USDT_DECIMALS) : '0.00';
  const isRegistered = userBasic !== undefined && userBasic !== null;

  // ====== Handlers ======
  const handleRefresh = useCallback(async () => {
    // ✅ Prevent concurrent refresh calls
    if (refreshInProgress.current) return;
    refreshInProgress.current = true;
    
    try {
      await Promise.all([
        refetchUserBasic(),
        refetchExtended(),
        refetchPending(),
        refetchPlpBalance(),
        refetchUsdtBalance(),
      ]);
      toast.refresh();
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      refreshInProgress.current = false;
    }
  }, [refetchUserBasic, refetchExtended, refetchPending, refetchPlpBalance, refetchUsdtBalance, toast]);

  const handleRegister = () => {
    if (!address) return;
    setRegistering(true);
    const referrer = isValidRef ? (refAddress as `0x${string}`) : zeroAddress;
    writeRegister({
      chainId: CHAIN_ID,
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PLP_ABI,
      functionName: 'register',
      args: [referrer],
    });
  };

  // ====== Effects ======
  useEffect(() => {
    if (registerSuccess && registering) {
      setRegistering(false);
      toast.registerSuccess();
      handleRefresh();
    }
  }, [registerSuccess, registering, toast, handleRefresh]);

  useEffect(() => {
    if (isRegisterError && registering) {
      setRegistering(false);
      toast.registerError();
      console.error('Registration error:', registerError);
    }
  }, [isRegisterError, registering, registerError, toast]);

  // ✅ FIXED: Only run once on mount and when address changes
  useEffect(() => {
    if (address && !initialLoadDone.current) {
      initialLoadDone.current = true;
      handleRefresh();
    }
  }, [address]); // Only address dependency

  // ✅ FIXED: Reset initialLoadDone when address disconnects
  useEffect(() => {
    if (!address) {
      initialLoadDone.current = false;
    }
  }, [address]);

  // ====== Network Check ======
  if (isConnected && chainId !== CHAIN_ID) {
    return (
      <div className="card p-8 text-center">
        <div className="text-6xl mb-4">🌐</div>
        <h3 className="text-lg font-semibold text-slate-800">Wrong Network</h3>
        <p className="text-sm text-slate-500 mt-1">Please switch to Polygon Mainnet</p>
        <button onClick={() => switchChain?.({ chainId: CHAIN_ID })} className="btn-primary mt-4">
          Switch Network
        </button>
      </div>
    );
  }

  const isLoading = plpLoading || usdtLoading || basicLoading;

  // ====== Render ======
  return (
    <div className="space-y-5">
      {/* ----- Connect / Disconnect Card ----- */}
      <div className="card p-6 text-center relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500"></div>
        {!isConnected ? (
          <>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-purple-500/30 flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Welcome to PolyGo</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed">
              Connect your wallet to view your balances, trade PLP, and earn USDT referral rewards.
            </p>
            <button onClick={() => open()} className="btn-primary mt-6 px-10 py-3.5 text-base shadow-xl shadow-purple-500/30">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656m-5.657 0a8 8 0 010-11.314m11.314 0a12.05 12.05 0 010 17.07M5.758 14.414a8 8 0 010-4.828M7 12h10" />
              </svg>
              Connect Wallet
            </button>
          </>
        ) : (
          <>
            <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-100 shadow-lg shadow-emerald-200/50 flex items-center justify-center mb-4">
              <svg className="h-8 w-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-800">Wallet Connected</h2>
            <p className="text-sm text-slate-500 mt-2">
              You're ready to trade on PolyGo. Keep track of your balances below.
            </p>
            <div className="flex justify-center gap-3 mt-4 flex-wrap">
              <button onClick={handleRefresh} disabled={refreshInProgress.current} className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-sm font-medium transition disabled:opacity-50">
                <svg className={`h-4 w-4 ${refreshInProgress.current ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Refresh
              </button>
              <button onClick={() => disconnect()} className="inline-flex items-center justify-center gap-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-100 px-4 py-2 rounded-xl text-sm font-medium transition active:scale-[0.98]">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Disconnect
              </button>
            </div>
          </>
        )}
      </div>

      {isConnected && (
        <>
          {/* ----- Register Prompt ----- */}
          {!isRegistered && !basicLoading && (
            <div className="card p-5 text-center border-2 border-amber-200 bg-amber-50/50">
              <p className="text-amber-700 font-medium">⚠️ You are not registered yet</p>
              {isValidRef && (
                <p className="text-xs text-amber-600 mt-1">
                  Referred by: <span className="font-mono">{refAddress?.slice(0,8)}…{refAddress?.slice(-6)}</span>
                </p>
              )}
              <button onClick={handleRegister} disabled={isRegisterPending || registering} className="btn-primary mt-3 text-sm">
                {isRegisterPending || registering ? 'Registering...' : 'Register Now'}
              </button>
            </div>
          )}

          {/* ----- Premium Balance Cards ----- */}
          <div className="grid grid-cols-2 gap-3">
            {/* PLP Card */}
            <div className="card p-4 relative overflow-hidden group hover:shadow-lg transition">
              <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  P
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">PLP Balance</p>
                  <p className="text-lg font-bold text-slate-800">{isLoading ? '...' : plpBal}</p>
                </div>
              </div>
            </div>

            {/* USDT Card */}
            <div className="card p-4 relative overflow-hidden group hover:shadow-lg transition">
              <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition" />
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold shadow-sm">
                  $
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">USDT Balance</p>
                  <p className="text-lg font-bold text-slate-800">{isLoading ? '...' : usdtBal}</p>
                </div>
              </div>
            </div>
          </div>

          {/* ----- Stats Grid ----- */}
          {isRegistered && !isLoading && (
            <div className="grid grid-cols-3 gap-2">
              <div className="card p-3 text-center bg-slate-50/80 border-slate-100">
                <p className="text-[9px] text-slate-400 uppercase tracking-wider">Team</p>
                <p className="text-base font-bold text-indigo-600">{directCount}</p>
                <p className="text-[8px] text-slate-400">{activeDirects} active</p>
              </div>
              <div className="card p-3 text-center bg-slate-50/80 border-slate-100">
                <p className="text-[9px] text-slate-400 uppercase tracking-wider">Pending</p>
                <p className="text-base font-bold text-amber-600">{pendingUSDT} USDT</p>
                {Number(pendingUSDT) > 0 && (
                  <button onClick={() => navigate('/marketplace')} className="text-[8px] text-indigo-500 hover:underline">
                    Claim →
                  </button>
                )}
              </div>
              <div className="card p-3 text-center bg-slate-50/80 border-slate-100">
                <p className="text-[9px] text-slate-400 uppercase tracking-wider">Referral</p>
                <p className="text-base font-bold text-purple-600">{referralBalance} USDT</p>
                <p className="text-[8px] text-slate-400">{isActiveUser ? '✅ Active' : 'Inactive'}</p>
              </div>
            </div>
          )}

          {/* ----- Quick Actions ----- */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate('/marketplace')}
              className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 transition active:scale-[0.97] flex items-center justify-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h2m4 0h4M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z" />
              </svg>
              <span className="font-semibold text-sm">Buy PLP</span>
            </button>
            <button
              onClick={() => navigate('/marketplace')}
              className="p-4 rounded-2xl bg-gradient-to-r from-purple-500 to-fuchsia-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition active:scale-[0.97] flex items-center justify-center gap-2"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
              <span className="font-semibold text-sm">Sell PLP</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}