import { useAccount, useReadContract, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS, PLP_ABI, USDT_DECIMALS, USDT_ADDRESS, PLP_ADDRESS } from '../constants';
import { ClaimReferral } from '../components/Referral/ClaimReferral';
import { TeamTree } from '../components/Referral/TeamTree';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { formatUnits, isAddress, zeroAddress } from 'viem';
import { ERC20_ABI } from '../abi/erc20Abi';
import { useToast } from '../hooks/useToast';

type UserBasicTuple = readonly [string, bigint, bigint, bigint, bigint, bigint, boolean];
type UserExtendedTuple = readonly [bigint, bigint, bigint, bigint, bigint];

interface ReferralWithStatus {
  address: `0x${string}`;
  isActive: boolean;
}

export default function Referral() {
  const { address, isConnected, status } = useAccount();
  const publicClient = usePublicClient();
  const toast = useToast();
  const [copied, setCopied] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [searchAddress, setSearchAddress] = useState('');
  const [lookupAddress, setLookupAddress] = useState<`0x${string}` | null>(null);
  
  // ✅ State for referral list with status
  const [referralList, setReferralList] = useState<ReferralWithStatus[]>([]);
  const [isReferralsLoading, setIsReferralsLoading] = useState(true);

  // ✅ Stable connection for Trust Wallet
  const stableAddress = useMemo(() => address, [address]);
  const isStablyConnected = useMemo(() => isConnected && status === 'connected', [isConnected, status]);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // ====== For connected user ======
  const { data: userBasic, refetch: refetchUserBasic } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'getUserBasicInfo',
    args: [stableAddress as `0x${string}`],
    query: { 
      enabled: !!stableAddress && isStablyConnected,
      staleTime: 30000,
      gcTime: 60000,
    },
  });

  const { data: extended, refetch: refetchExtended } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'getUserExtendedInfo',
    args: [stableAddress as `0x${string}`],
    query: { 
      enabled: !!stableAddress && isStablyConnected,
      staleTime: 30000,
      gcTime: 60000,
    },
  });

  // ====== Get Total Team Count (All Levels) ======
  const { data: totalTeamCount, refetch: refetchTotalTeam } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'getTotalTeamCount',
    args: [stableAddress as `0x${string}`],
    query: { 
      enabled: !!stableAddress && isStablyConnected,
      staleTime: 30000,
      gcTime: 60000,
    },
  });

  // ====== Get Direct Referrals List ======
  const { 
    data: referralsData, 
    isLoading: referralsLoading,
    refetch: refetchReferrals,
    error: referralsError,
  } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'getDirectReferralsPaginated',
    args: [stableAddress as `0x${string}`, 0, 100],
    query: { 
      enabled: !!stableAddress && isStablyConnected,
      staleTime: 30000,
      gcTime: 60000,
    },
  });

  // ====== Check if user is active ======
  const checkUserActive = useCallback(async (addr: `0x${string}`): Promise<boolean> => {
    try {
      if (!publicClient) return false;
      
      const result = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: PLP_ABI,
        functionName: 'isActive',
        args: [addr],
      }) as boolean;
      
      return result || false;
    } catch (error) {
      console.error(`Error checking active status for ${addr}:`, error);
      return false;
    }
  }, [publicClient]);

  // ====== Process referrals data with active status ======
  useEffect(() => {
    const processReferrals = async () => {
      if (!referralsData || !isMounted.current) return;
      
      console.log('📊 Referrals Data:', referralsData);
      
      if (Array.isArray(referralsData) && referralsData.length >= 2) {
        const list = referralsData[0] as `0x${string}`[];
        
        // Check active status for each referral
        const referralsWithStatus = await Promise.all(
          list.map(async (addr) => ({
            address: addr,
            isActive: await checkUserActive(addr),
          }))
        );
        
        if (isMounted.current) {
          setReferralList(referralsWithStatus);
          setIsReferralsLoading(false);
        }
      }
    };

    processReferrals();
  }, [referralsData, checkUserActive]);

  // ====== For searched address ======
  const {
    data: searchedBasic, 
    isLoading: searchedBasicLoading,
    error: searchedBasicError,
    refetch: refetchSearchedBasic,
  } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'getUserBasicInfo',
    args: [lookupAddress as `0x${string}`],
    query: { 
      enabled: !!lookupAddress && isAddress(lookupAddress),
      retry: false,
    },
  });

  // ====== For searched address – balances ======
  const { data: searchedPlpBalance } = useReadContract({
    address: PLP_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [lookupAddress as `0x${string}`],
    query: { 
      enabled: !!lookupAddress && isAddress(lookupAddress),
      staleTime: 30000,
      gcTime: 60000,
    },
  });

  const { data: searchedUsdtBalance } = useReadContract({
    address: USDT_ADDRESS as `0x${string}`,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: [lookupAddress as `0x${string}`],
    query: { 
      enabled: !!lookupAddress && isAddress(lookupAddress),
      staleTime: 30000,
      gcTime: 60000,
    },
  });

  // ====== Search handler ======
  const handleSearch = () => {
    if (isAddress(searchAddress)) {
      setLookupAddress(searchAddress as `0x${string}`);
      refetchSearchedBasic();
    } else {
      toast.error('Invalid Address', 'Please enter a valid Ethereum address.');
    }
  };

  // ====== Determine if user is registered ======
  const isSearchedRegistered = searchedBasic !== undefined && searchedBasic !== null && !searchedBasicError;

  // ====== Extract searched user data ======
  const searchedBasicData = searchedBasic as UserBasicTuple | null;

  // ====== Format values ======
  const searchedReferrer = isSearchedRegistered && searchedBasicData ? searchedBasicData[0] : zeroAddress;
  const searchedDirectCount = isSearchedRegistered && searchedBasicData ? Number(searchedBasicData[4]) : 0;
  const searchedPlpBal = searchedPlpBalance 
    ? Number(formatUnits(searchedPlpBalance as bigint, 18)).toFixed(2) 
    : '0.00';
  const searchedUsdtBal = searchedUsdtBalance 
    ? Number(formatUnits(searchedUsdtBalance as bigint, USDT_DECIMALS)).toFixed(2) 
    : '0.00';

  // ====== For connected user ======
  const basic = (userBasic ?? null) as UserBasicTuple | null;
  const ext = (extended ?? null) as UserExtendedTuple | null;
  const directCount = basic?.[4] ? Number(basic[4]) : 0;
  const activeDirects = basic?.[5] ? Number(basic[5]) : 0;
  const isActiveUser = (basic?.[6] as boolean) || false;
  const referralBalance = basic?.[1] ? formatUnits(basic[1] as bigint, USDT_DECIMALS) : '0.00';
  const dailyEarned = ext?.[2] ? formatUnits(ext[2] as bigint, USDT_DECIMALS) : '0.00';
  const activeUntil = ext?.[0] ? Number(ext[0]) : 0;
  const activeUntilDate = activeUntil > 0 ? new Date(activeUntil * 1000).toLocaleDateString() : '—';

  const referralLink = stableAddress ? `${window.location.origin}/?ref=${stableAddress}` : '';

  const handleCopy = async () => {
    if (!referralLink) return;
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.referralLinkCopied();
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy Failed', 'Could not copy link.');
    }
  };

  // ====== Copy address handler ======
  const handleCopyAddress = async (addr: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(addr);
      setCopiedAddress(addr);
      toast.success('Copied!', 'Address copied to clipboard');
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch {
      toast.error('Copy Failed', 'Could not copy address');
    }
  };

  // ====== Refresh all data ======
  const handleRefresh = useCallback(async () => {
    if (!isMounted.current) return;
    setIsReferralsLoading(true);
    try {
      await Promise.all([
        refetchUserBasic(),
        refetchExtended(),
        refetchReferrals(),
        refetchTotalTeam(),
      ]);
      // Re-process referrals with status
      if (referralsData && isMounted.current) {
        const list = (referralsData as any)[0] as `0x${string}`[];
        const referralsWithStatus = await Promise.all(
          list.map(async (addr) => ({
            address: addr,
            isActive: await checkUserActive(addr),
          }))
        );
        if (isMounted.current) {
          setReferralList(referralsWithStatus);
        }
      }
      if (isMounted.current) {
        toast.refresh();
      }
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      if (isMounted.current) {
        setIsReferralsLoading(false);
      }
    }
  }, [refetchUserBasic, refetchExtended, refetchReferrals, refetchTotalTeam, referralsData, checkUserActive, toast]);

  // ====== Format address for display ======
  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!isStablyConnected) {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3">
          <svg className="h-7 w-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-slate-600">Connect your wallet</p>
        <p className="text-xs text-slate-400 mt-1">to view your referral program and earnings.</p>
      </div>
    );
  }

  const totalTeam = totalTeamCount ? Number(totalTeamCount) : 0;

  return (
    <div className="space-y-5">
      {/* Header with Refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Referral Program</h1>
          <p className="text-sm text-slate-500 mt-1">Invite friends, earn USDT rewards on every purchase.</p>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition border border-indigo-100"
          title="Refresh"
        >
          <svg className={`h-5 w-5 ${isReferralsLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* ====== REFERRAL STATS CARDS ====== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4 text-center bg-gradient-to-br from-indigo-50/80 to-indigo-100/30 border-indigo-200">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Total Team</p>
          <p className="text-2xl font-bold text-indigo-600">
            {isReferralsLoading || referralsLoading ? '...' : totalTeam}
          </p>
          <p className="text-[10px] text-slate-400">All levels combined</p>
        </div>

        <div className="card p-4 text-center bg-gradient-to-br from-emerald-50/80 to-emerald-100/30 border-emerald-200">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Direct Team</p>
          <p className="text-2xl font-bold text-emerald-600">
            {isReferralsLoading || referralsLoading ? '...' : directCount}
          </p>
          <p className="text-[10px] text-slate-400">Total direct referrals</p>
        </div>

        <div className="card p-4 text-center bg-gradient-to-br from-blue-50/80 to-blue-100/30 border-blue-200">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Total Active</p>
          <p className="text-2xl font-bold text-blue-600">{activeDirects}</p>
          <p className="text-[10px] text-slate-400">Active in last 2 days</p>
        </div>

        <div className="card p-4 text-center bg-gradient-to-br from-purple-50/80 to-purple-100/30 border-purple-200">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Direct Active</p>
          <p className="text-2xl font-bold text-purple-600">{activeDirects}</p>
          <p className="text-[10px] text-slate-400">Active direct referrals</p>
        </div>
      </div>

      {/* ====== EARNINGS STATS CARDS ====== */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="card p-4 text-center bg-gradient-to-br from-amber-50/80 to-amber-100/30 border-amber-200">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Referral Balance</p>
          <p className="text-2xl font-bold text-amber-600">{referralBalance} USDT</p>
          <p className="text-[10px] text-slate-400">Available to claim</p>
        </div>

        <div className="card p-4 text-center bg-gradient-to-br from-rose-50/80 to-rose-100/30 border-rose-200">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Today's Earnings</p>
          <p className="text-2xl font-bold text-rose-600">{dailyEarned} USDT</p>
          <p className="text-[10px] text-slate-400">Daily cap: 200 USDT</p>
        </div>

        <div className="card p-4 text-center bg-gradient-to-br from-teal-50/80 to-teal-100/30 border-teal-200">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Account Status</p>
          <p className={`text-2xl font-bold ${isActiveUser ? 'text-teal-600' : 'text-slate-400'}`}>
            {isActiveUser ? '🟢 Active' : '⚪ Inactive'}
          </p>
          <p className="text-[10px] text-slate-400">
            {isActiveUser ? `Until ${activeUntilDate}` : 'Buy 10+ USDT to activate'}
          </p>
        </div>

        <div className="card p-4 text-center bg-gradient-to-br from-cyan-50/80 to-cyan-100/30 border-cyan-200">
          <p className="text-xs text-slate-500 uppercase tracking-wide">Registered Since</p>
          <p className="text-lg font-bold text-cyan-600">
            {ext?.[1] ? new Date(Number(ext[1]) * 1000).toLocaleDateString() : '—'}
          </p>
          <p className="text-[10px] text-slate-400">Join date</p>
        </div>
      </div>

      {/* Referral Link */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-1">
          <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white text-sm">🔗</span>
          <h3 className="font-semibold text-slate-800">Your Referral Link</h3>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Share this link — you earn USDT rewards when your referrals buy PLP.
        </p>
        <div className="flex">
          <input
            readOnly
            value={referralLink}
            className="flex-1 bg-indigo-50/50 border border-indigo-100 rounded-l-xl px-4 py-2.5 text-slate-700 text-sm font-mono focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className={`px-5 rounded-r-xl text-sm font-semibold transition flex items-center gap-2 ${
              copied
                ? 'bg-emerald-500 text-white'
                : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600'
            }`}
          >
            {copied ? (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Claim Referral */}
      <ClaimReferral />

      {/* Referral Lookup */}
      <div className="card p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center text-white text-sm">🔍</span>
          <h3 className="font-semibold text-slate-800">Look Up Referral Info</h3>
        </div>
        <p className="text-xs text-slate-400 mb-3">
          Enter any address to see its referral level, upline, and balances.
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            placeholder="Enter wallet address (0x...)"
            className="flex-1 bg-indigo-50/50 border border-indigo-100 rounded-xl px-4 py-2.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-sm font-semibold hover:from-indigo-600 hover:to-purple-600 transition"
          >
            Search
          </button>
        </div>
        {lookupAddress && !searchedBasicLoading && (
          <div className="mt-4 space-y-3 border-t border-indigo-100 pt-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-slate-400">Address</p>
                <p 
                  className="font-mono text-xs break-all cursor-pointer hover:text-indigo-600 transition flex items-center gap-1"
                  onClick={(e) => handleCopyAddress(lookupAddress, e)}
                >
                  {lookupAddress}
                  <svg className="h-3 w-3 text-slate-400 hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  {copiedAddress === lookupAddress && (
                    <span className="text-emerald-500 text-[10px] font-medium">✓ Copied!</span>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Status</p>
                <p className={`font-semibold ${isSearchedRegistered ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {isSearchedRegistered ? '✅ Registered' : 'Not Registered'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Referrer</p>
                <p 
                  className="font-mono text-xs break-all cursor-pointer hover:text-indigo-600 transition flex items-center gap-1"
                  onClick={(e) => searchedReferrer !== zeroAddress && handleCopyAddress(searchedReferrer, e)}
                >
                  {isSearchedRegistered && searchedReferrer !== zeroAddress
                    ? formatAddress(searchedReferrer)
                    : 'None'}
                  {isSearchedRegistered && searchedReferrer !== zeroAddress && (
                    <svg className="h-3 w-3 text-slate-400 hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">PLP Balance</p>
                <p className="font-semibold text-indigo-600">{searchedPlpBal} PLP</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">USDT Balance</p>
                <p className="font-semibold text-emerald-600">{searchedUsdtBal} USDT</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Direct Referrals</p>
                <p className="font-semibold">
                  {isSearchedRegistered ? searchedDirectCount : '—'}
                </p>
              </div>
            </div>
            {searchedBasicError && (
              <div className="text-xs text-amber-600 bg-amber-50 p-2 rounded-lg">
                ⚠️ This address is not registered in the PolyGo Network.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ✅ DIRECT REFERRALS LIST with Active/Inactive Status */}
      <div className="card p-5">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm">📋</span>
            <h3 className="text-lg font-semibold text-slate-800">Direct Referrals List</h3>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-semibold">
              Total: {isReferralsLoading || referralsLoading ? '...' : referralList.length}
            </span>
            <button
              onClick={handleRefresh}
              className="text-xs text-indigo-500 hover:text-indigo-700 font-medium flex items-center gap-1"
            >
              <svg className={`h-3 w-3 ${isReferralsLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>

        {/* Loading State */}
        {(isReferralsLoading || referralsLoading) && (
          <div className="bg-indigo-50/50 rounded-xl p-8 text-center">
            <div className="animate-pulse flex flex-col items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-indigo-200"></div>
              <div className="h-4 w-32 bg-indigo-200 rounded"></div>
              <div className="h-3 w-24 bg-indigo-100 rounded"></div>
            </div>
            <p className="text-slate-500 text-sm mt-3">Loading referrals...</p>
          </div>
        )}

        {/* Error State */}
        {referralsError && (
          <div className="bg-rose-50/50 rounded-xl p-6 text-center border border-rose-100">
            <p className="text-rose-600 text-sm">⚠️ Error loading referrals</p>
            <button 
              onClick={handleRefresh} 
              className="mt-2 text-xs text-indigo-600 hover:text-indigo-800 font-medium underline"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isReferralsLoading && !referralsLoading && !referralsError && referralList.length === 0 && (
          <div className="bg-indigo-50/50 rounded-xl p-8 text-center">
            <div className="text-5xl mb-3">👤</div>
            <p className="text-slate-500 text-sm font-medium">No referrals yet.</p>
            <p className="text-slate-400 text-xs mt-1">Share your referral link to start earning!</p>
          </div>
        )}

        {/* Referrals List with Status */}
        {!isReferralsLoading && !referralsLoading && !referralsError && referralList.length > 0 && (
          <div className="space-y-2 max-h-80 overflow-y-auto pr-1 custom-scrollbar">
            {referralList.map((item, i) => (
              <div
                key={i}
                className="flex justify-between items-center text-sm bg-gradient-to-b from-indigo-50/50 to-white border border-indigo-50 rounded-xl px-4 py-3 hover:shadow-sm transition-shadow duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="h-7 w-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold">
                    {i + 1}
                  </span>
                  <div>
                    <p 
                      className="font-mono text-slate-700 cursor-pointer hover:text-indigo-600 transition flex items-center gap-1"
                      onClick={(e) => handleCopyAddress(item.address, e)}
                    >
                      {formatAddress(item.address)}
                      <svg className="h-3 w-3 text-slate-400 hover:text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      {copiedAddress === item.address && (
                        <span className="text-emerald-500 text-[10px] font-medium">✓ Copied!</span>
                      )}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {item.address.slice(0, 10)}...{item.address.slice(-6)}
                    </p>
                  </div>
                </div>
                {/* ✅ Active/Inactive Status */}
                {item.isActive ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Active
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full rounded-full bg-slate-300"></span>
                    </span>
                    Inactive
                  </span>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Total count footer */}
        {!isReferralsLoading && !referralsLoading && !referralsError && referralList.length > 0 && (
          <div className="mt-3 pt-3 border-t border-indigo-50 flex justify-between items-center text-xs text-slate-400">
            <span>Showing {referralList.length} direct referrals</span>
            <span className="text-indigo-500 font-medium">Total Team: {totalTeam}</span>
          </div>
        )}
      </div>

      {/* ✅ TEAM TREE */}
      <TeamTree address={stableAddress} />

      {/* Instructions Box */}
      <div className="card p-4 bg-indigo-50/50 border border-indigo-100">
        <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">How Referral Rewards Work</p>
        <ul className="mt-2 text-xs text-slate-600 space-y-1 list-disc list-inside">
          <li>When someone registers using your link, they become your <strong>direct referral</strong>.</li>
          <li>
            You earn <strong>0.1%</strong> of the USDT purchase amount from your referrals on <strong>every level</strong>
            (across up to 10 levels).
          </li>
          <li>
            Rewards are distributed only if your referral is <strong>active</strong> (bought at least 10 USDT in the last 2 days).
          </li>
          <li>
            Daily earning cap: <strong>200 USDT</strong> per user, and <strong>100 USDT</strong> per leg.
          </li>
          <li>
            Referral balance is <strong>claimable</strong> anytime (minimum 5 USDT).
          </li>
          <li>You can track your active referrals and earnings in the list below.</li>
        </ul>
      </div>
    </div>
  );
}