import { useEffect, useState, useCallback, useRef } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from 'wagmi';
import { CONTRACT_ADDRESS, PLP_ABI, PLP_DECIMALS, USDT_DECIMALS, CHAIN_ID } from '../../constants';
import { formatUnits, type Address } from 'viem';
import { useToast } from '../../hooks/useToast';
import { validateSettlement } from '../../utils/validation';

interface SellOrder {
  seller: `0x${string}`;
  amount: bigint;
  filled: bigint;
  remaining: bigint;
  time: bigint;
  canSettle: boolean;
  isActive: boolean;
  isCancelled: boolean;
  timeLeft: bigint;
}

const PAGE_SIZE = 20;

export default function Orders() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const toast = useToast();
  const fetchingRef = useRef(false);
  
  // ✅ Handlers to prevent duplicate processing
  const handledSettle = useRef(false);
  const handledClaim = useRef(false);
  const handledCancel = useRef(false);
  
  const [orders, setOrders] = useState<SellOrder[]>([]);
  const [pendingOrders, setPendingOrders] = useState<SellOrder[]>([]);
  const [readyOrders, setReadyOrders] = useState<SellOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);

  // ✅ Get queue info with staleTime
  const { data: queueLength, refetch: refetchQueueLength } = useReadContract({
    chainId: CHAIN_ID,
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'getSellQueueLength',
    query: { 
      enabled: true,
      staleTime: 60000,
      gcTime: 300000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  });

  const { data: queueStart, refetch: refetchQueueStart } = useReadContract({
    chainId: CHAIN_ID,
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'queueStart',
    query: { 
      enabled: true,
      staleTime: 60000,
      gcTime: 300000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  });

  const { data: sellWaitTime } = useReadContract({
    chainId: CHAIN_ID,
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'sellWaitTime',
    query: { enabled: true, staleTime: 1000 * 60 * 5 },
  });

  const { data: pendingSettlement, refetch: refetchPending } = useReadContract({
    chainId: CHAIN_ID,
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'pendingSettlement',
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  });

  // ✅ Fetch only 20 orders with pagination
  const fetchOrders = useCallback(async () => {
    if (!publicClient || queueLength === undefined || queueStart === undefined) return;
    if (fetchingRef.current) return;
    
    fetchingRef.current = true;
    setLoading(true);

    try {
      const total = Number(queueLength);
      const start = Number(queueStart);
      const pendingCount = total - start;
      
      setTotalOrders(pendingCount);

      if (pendingCount === 0) {
        setOrders([]);
        setPendingOrders([]);
        setReadyOrders([]);
        setLoading(false);
        return;
      }

      const offset = page * PAGE_SIZE;
      const end = Math.min(start + offset + PAGE_SIZE, total);
      
      if (offset >= pendingCount) {
        setOrders([]);
        setPendingOrders([]);
        setReadyOrders([]);
        setLoading(false);
        return;
      }

      const contracts = [];
      for (let i = start + offset; i < end; i++) {
        contracts.push({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: PLP_ABI,
          functionName: 'getSellOrder',
          args: [BigInt(i)],
        });
      }

      const results = await publicClient.multicall({
        contracts,
      }) as any[];

      const orderList: SellOrder[] = [];
      for (let i = 0; i < results.length; i++) {
        const result = results[i];
        if (result.status === 'success') {
const r = result.result as [Address, bigint, bigint, bigint, bigint, boolean, boolean, boolean, bigint];
          orderList.push({
            seller: r[0],
            amount: r[1],
            filled: r[2],
            remaining: r[3],
            time: r[4],
            canSettle: r[5],
            isActive: r[6],
            isCancelled: r[7],
            timeLeft: r[8],
          });
        }
      }

      setOrders(orderList);

      const waitTime = Number(sellWaitTime || 180);
      const currentTime = Math.floor(Date.now() / 1000);

      const pending = orderList.filter(order => {
        const elapsed = currentTime - Number(order.time);
        return order.isActive && !order.isCancelled && elapsed < waitTime;
      });

      const ready = orderList.filter(order => {
        const elapsed = currentTime - Number(order.time);
        return order.isActive && !order.isCancelled && elapsed >= waitTime;
      });

      setPendingOrders(pending);
      setReadyOrders(ready);

    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  }, [publicClient, queueLength, queueStart, page, sellWaitTime]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // ✅ Timer for status updates (only re-filter, no RPC)
  useEffect(() => {
    if (!sellWaitTime || orders.length === 0) return;

    const waitTime = Number(sellWaitTime);
    const timer = setInterval(() => {
      const currentTime = Math.floor(Date.now() / 1000);

      const pending = orders.filter(order => {
        const elapsed = currentTime - Number(order.time);
        return order.isActive && !order.isCancelled && elapsed < waitTime;
      });

      const ready = orders.filter(order => {
        const elapsed = currentTime - Number(order.time);
        return order.isActive && !order.isCancelled && elapsed >= waitTime;
      });

      setPendingOrders(pending);
      setReadyOrders(ready);
    }, 1000);

    return () => clearInterval(timer);
  }, [orders, sellWaitTime]);

  // ✅ Refresh function
  const handleRefresh = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        refetchQueueLength(),
        refetchQueueStart(),
        refetchPending(),
      ]);
    } catch (error) {
      console.error('Refresh error:', error);
    } finally {
      setLoading(false);
    }
  }, [refetchQueueLength, refetchQueueStart, refetchPending]);

  // ✅ Pagination handlers
  const nextPage = () => {
    if ((page + 1) * PAGE_SIZE < totalOrders) {
      setPage(page + 1);
    }
  };

  const prevPage = () => {
    if (page > 0) {
      setPage(page - 1);
    }
  };

  // ========== WRITE CONTRACTS ==========
  
  // ✅ Cancel Order
  const { writeContract: writeCancel, data: cancelHash, isPending: isCancelPending } = useWriteContract();
  const { isSuccess: cancelSuccess } = useWaitForTransactionReceipt({ hash: cancelHash });

  // ✅ FIX: Only run once, no toast in dependency
  useEffect(() => {
    if (cancelSuccess && !handledCancel.current) {
      handledCancel.current = true;
      toast.success('Cancelled', 'Order cancelled successfully');
      handleRefresh();
    }
  }, [cancelSuccess]); // ✅ Only cancelSuccess, no toast

  // ✅ Reset handler when cancelSuccess becomes false
  useEffect(() => {
    if (!cancelSuccess) {
      handledCancel.current = false;
    }
  }, [cancelSuccess]);

  // ✅ Settle Orders
  const { writeContract: writeSettle, data: settleHash, isPending: isSettlePending } = useWriteContract();
  const { isSuccess: settleSuccess } = useWaitForTransactionReceipt({ hash: settleHash });

  // ✅ FIX: Only run once, no toast in dependency
  useEffect(() => {
    if (settleSuccess && !handledSettle.current) {
      handledSettle.current = true;
      toast.success('Settled', 'Orders settled successfully');
      handleRefresh();
    }
  }, [settleSuccess]); // ✅ Only settleSuccess, no toast

  useEffect(() => {
    if (!settleSuccess) {
      handledSettle.current = false;
    }
  }, [settleSuccess]);

  // ✅ Claim Settlement
  const { writeContract: writeClaim, data: claimHash, isPending: isClaimPending } = useWriteContract();
  const { isSuccess: claimSuccess } = useWaitForTransactionReceipt({ hash: claimHash });

  // ✅ FIX: Only run once, no toast in dependency
  useEffect(() => {
    if (claimSuccess && !handledClaim.current) {
      handledClaim.current = true;
      const amount = pendingSettlement 
        ? formatUnits(pendingSettlement as bigint, USDT_DECIMALS) 
        : '0.00';
      toast.settlementSuccess(amount);
      refetchPending();
    }
  }, [claimSuccess]); // ✅ Only claimSuccess, no toast

  useEffect(() => {
    if (!claimSuccess) {
      handledClaim.current = false;
    }
  }, [claimSuccess]);

  // ---------- Handlers ----------
  const handleCancel = (queueIndex: number) => {
    writeCancel({
      chainId: CHAIN_ID,
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PLP_ABI,
      functionName: 'cancelSellOrder',
      args: [BigInt(queueIndex)],
    });
  };

  const handleSettle = () => {
    writeSettle({
      chainId: CHAIN_ID,
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PLP_ABI,
      functionName: 'settle',
      args: [BigInt(20)],
    });
  };

const handleClaimSettlement = () => {
    const settlement = (pendingSettlement as bigint) || 0n;
    const validation = validateSettlement(settlement);
    if (!validation.isValid) {
      toast.error('Cannot Claim', validation.firstError || 'No settlement to claim');
      return;
    }
    writeClaim({
      chainId: CHAIN_ID,
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PLP_ABI,
      functionName: 'claimSettlement',
      args: [],
    });
  };

  // Format pending amount
  const formattedPending = pendingSettlement
    ? formatUnits(pendingSettlement as bigint, USDT_DECIMALS)
    : '0.00';

  // Format time left
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return 'Ready to settle';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const userOrders = orders.filter(
    (order) => order.seller.toLowerCase() === address?.toLowerCase() && order.isActive && !order.isCancelled
  );

  const canSettle = readyOrders.length > 0;
  const totalPages = Math.ceil(totalOrders / PAGE_SIZE);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="card p-8 text-center">
          <div className="animate-pulse">
            <div className="h-8 w-8 mx-auto bg-indigo-200 rounded-full mb-3"></div>
            <p className="text-sm text-slate-500">Loading orders...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Settlement Engine */}
      <div className="card p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <span className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-md shadow-purple-500/25">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-800">Settlement Engine</p>
            <p className="text-xs text-slate-400">
              Total Pending: <span className="font-semibold text-indigo-600">{totalOrders}</span>
              {' • '}
              Your Orders: <span className="font-semibold text-emerald-600">{userOrders.length}</span>
              {' • '}
              Ready: <span className="font-semibold text-emerald-600">{readyOrders.length}</span>
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1">
          {pendingOrders.length > 0 && (
            <div className="text-xs font-medium text-amber-600">
              Next settlement in: <span className="font-mono">{formatTime(Number(sellWaitTime || 180))}</span>
            </div>
          )}
          {readyOrders.length > 0 && (
            <div className="text-xs font-medium text-emerald-600">
              <span className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {readyOrders.length} order{readyOrders.length > 1 ? 's' : ''} ready!
              </span>
            </div>
          )}
          <button
            onClick={handleSettle}
            disabled={isSettlePending || readyOrders.length === 0}
            className={`btn-primary text-sm ${canSettle ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : ''}`}
          >
            {isSettlePending ? 'Processing...' : `Settle Next 20 (${readyOrders.length} ready)`}
          </button>
        </div>
      </div>

      {/* Claim Settlement */}
      {Number(formattedPending) > 0 && (
        <div className="card p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-l-4 border-l-emerald-500">
          <div>
            <p className="text-sm font-medium text-slate-700">Pending Settlement</p>
            <p className="text-2xl font-bold text-emerald-600">{formattedPending} USDT</p>
            <p className="text-xs text-slate-400">Claim the USDT you earned from sell orders.</p>
          </div>
          <button
            onClick={handleClaimSettlement}
            disabled={isClaimPending}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-semibold text-sm shadow-md hover:bg-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isClaimPending ? 'Claiming...' : 'Claim Settlement'}
          </button>
        </div>
      )}

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="card p-8 text-center">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3">
            <svg className="h-7 w-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-sm font-medium text-slate-600">No orders</p>
          <p className="text-xs text-slate-400 mt-1">Place a sell order to see it here.</p>
        </div>
      ) : (
        <>
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Showing {orders.length} of {totalOrders} orders</span>
            <span>Page {page + 1} / {totalPages}</span>
          </div>

          {orders.map((order, idx) => {
            const orderTime = Number(order.time);
            const waitTime = Number(sellWaitTime || 180);
            const currentTime = Math.floor(Date.now() / 1000);
            const elapsed = currentTime - orderTime;
            const remaining = waitTime - elapsed;
            const isMyOrder = order.seller.toLowerCase() === address?.toLowerCase();
            const isReady = remaining <= 0 && order.isActive && !order.isCancelled;

            return (
              <div
                key={idx}
                className={`card p-4 flex justify-between items-center gap-3 mb-2 border-l-4 ${
                  isMyOrder ? 'border-l-blue-500' : isReady ? 'border-l-emerald-500' : 'border-l-amber-500'
                } ${isReady ? 'bg-emerald-50/30' : ''}`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                      isMyOrder ? 'bg-blue-50 text-blue-600 border border-blue-100' :
                      isReady ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                      'bg-amber-50 text-amber-600 border border-amber-100'
                    }`}>
                      {isMyOrder ? 'Your Order' : isReady ? 'Ready' : 'Pending'}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(Number(order.time) * 1000).toLocaleString()}
                    </span>
                    {!isReady && order.isActive && !order.isCancelled && (
                      <span className="text-[10px] text-amber-500 font-medium">
                        ⏳ {formatTime(remaining)}
                      </span>
                    )}
                    {isReady && (
                      <span className="text-[10px] text-emerald-500 font-medium">✅ Ready</span>
                    )}
                    <span className="text-[10px] text-slate-400">#{page * PAGE_SIZE + idx + 1}</span>
                  </div>
                  <div className="text-sm text-slate-700">
                    <span className="font-semibold">{formatUnits(order.amount, PLP_DECIMALS)}</span> PLP
                    <span className="mx-2 text-slate-300">•</span>
                    <span className="text-slate-500">Filled: <span className="font-medium text-emerald-600">{formatUnits(order.filled, PLP_DECIMALS)}</span></span>
                    <span className="mx-2 text-slate-300">•</span>
                    <span className="text-slate-500">Remaining: <span className="font-medium text-amber-600">{formatUnits(order.remaining, PLP_DECIMALS)}</span></span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Seller: {order.seller.slice(0, 6)}...{order.seller.slice(-4)}
                    {isMyOrder && <span className="ml-2 text-blue-500 font-medium">(You)</span>}
                  </div>
                </div>
                {isMyOrder && order.isActive && !order.isCancelled && (
                  <button
                    onClick={() => handleCancel(page * PAGE_SIZE + idx)}
                    disabled={isCancelPending}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition disabled:opacity-50"
                  >
                    Cancel
                  </button>
                )}
              </div>
            );
          })}

          {totalPages > 1 && (
            <div className="flex justify-between items-center card p-3">
              <button
                onClick={prevPage}
                disabled={page === 0}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                ← Prev
              </button>
              <span className="text-sm text-slate-500">
                Page {page + 1} of {totalPages}
              </span>
              <button
                onClick={nextPage}
                disabled={(page + 1) * PAGE_SIZE >= totalOrders}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-50 text-indigo-600 hover:bg-indigo-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Refresh */}
      <div className="flex justify-center">
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition flex items-center gap-2 disabled:opacity-50"
        >
          <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Refreshing...' : 'Refresh Orders'}
        </button>
      </div>

      {/* Instructions */}
      <div className="card p-4 bg-indigo-50/50 border border-indigo-100">
        <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">How Settlement Works</p>
        <ul className="mt-2 text-xs text-slate-600 space-y-1 list-disc list-inside">
          <li>When you sell PLP, your order enters a queue.</li>
          <li>Settlement wait time: <strong>{Number(sellWaitTime || 180) / 60} minutes</strong></li>
          <li><strong>Pending:</strong> Waiting for settlement time</li>
          <li><strong>Ready:</strong> Can be settled now</li>
          <li>Click <strong>"Settle Next 20"</strong> to process ready orders</li>
          <li>After settlement, claim USDT from <strong>Pending Settlement</strong></li>
          <li><strong>Showing 20 orders per page</strong> for performance</li>
        </ul>
      </div>
    </div>
  );
}