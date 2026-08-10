import { useState } from 'react';
import { useWriteContract, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, PLP_ABI, PLP_DECIMALS, USDT_DECIMALS } from '../../constants';
import { parseUnits, formatUnits } from 'viem';

export default function LimitSettings() {
  const [minSell, setMinSell] = useState('');
  const [sellLimit, setSellLimit] = useState('');
  const [dailyBuyCap, setDailyBuyCap] = useState('');
  const [dailySellCap, setDailySellCap] = useState('');

  const { writeContract, isPending } = useWriteContract();

  // Current values (PLP amounts use PLP_DECIMALS, caps are USDT)
  const { data: minSellVal } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'minSell',
  });
  const { data: sellLimitVal } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'sellLimit',
  });
  const { data: dailyBuyCapVal } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'dailyBuyCap',
  });
  const { data: dailySellCapVal } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'dailySellCap',
  });

  const handleUpdateMinSell = () => {
    if (!minSell) return;
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PLP_ABI,
      functionName: 'updateMinSell',
      args: [parseUnits(minSell, PLP_DECIMALS)],
    });
  };

  const handleUpdateSellLimit = () => {
    if (!sellLimit) return;
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PLP_ABI,
      functionName: 'updateSellLimit',
      args: [parseUnits(sellLimit, PLP_DECIMALS)],
    });
  };

  const handleUpdateCaps = () => {
    if (!dailyBuyCap || !dailySellCap) return;
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PLP_ABI,
      functionName: 'updateDailyCaps',
      args: [parseUnits(dailyBuyCap, USDT_DECIMALS), parseUnits(dailySellCap, USDT_DECIMALS)],
    });
  };

  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-white text-sm">📏</span>
        <h3 className="font-semibold text-slate-800">Limit Settings</h3>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="label-text">
            Min Sell (currently {minSellVal ? formatUnits(minSellVal as bigint, PLP_DECIMALS) : '0'} PLP)
          </label>
          <input
            type="number"
            placeholder="Min sell PLP"
            value={minSell}
            onChange={e => setMinSell(e.target.value)}
            className="input-field"
          />
        </div>
        <button onClick={handleUpdateMinSell} disabled={isPending} className="btn-primary">
          Update
        </button>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="label-text">
            Sell Limit (currently {sellLimitVal ? formatUnits(sellLimitVal as bigint, PLP_DECIMALS) : '0'} PLP)
          </label>
          <input
            type="number"
            placeholder="Sell limit PLP"
            value={sellLimit}
            onChange={e => setSellLimit(e.target.value)}
            className="input-field"
          />
        </div>
        <button onClick={handleUpdateSellLimit} disabled={isPending} className="btn-primary">
          Update
        </button>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <label className="label-text">
            Daily Buy Cap (currently {dailyBuyCapVal ? formatUnits(dailyBuyCapVal as bigint, USDT_DECIMALS) : '0'} USDT)
          </label>
          <input
            type="number"
            placeholder="Daily buy cap USDT"
            value={dailyBuyCap}
            onChange={e => setDailyBuyCap(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="flex-1">
          <label className="label-text">
            Daily Sell Cap (currently {dailySellCapVal ? formatUnits(dailySellCapVal as bigint, USDT_DECIMALS) : '0'} USDT)
          </label>
          <input
            type="number"
            placeholder="Daily sell cap USDT"
            value={dailySellCap}
            onChange={e => setDailySellCap(e.target.value)}
            className="input-field"
          />
        </div>
        <button onClick={handleUpdateCaps} disabled={isPending} className="btn-primary">
          Update
        </button>
      </div>
    </div>
  );
}
