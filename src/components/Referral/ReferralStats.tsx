import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, PLP_ABI, USDT_DECIMALS } from '../../constants';
import { formatUnits } from 'viem';

export const ReferralStats = () => {
  const { address } = useAccount();

  const { data: userBasic } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'getUserBasicInfo',
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  });

  const { data: extended } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'getUserExtendedInfo',
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  });

  if (!userBasic) {
    return (
      <div className="card p-5">
        <h3 className="text-lg font-semibold text-slate-800">Referral Stats</h3>
        <p className="text-slate-400 text-sm mt-2">Connect your wallet to view stats</p>
      </div>
    );
  }

  const basic = userBasic as readonly [string, bigint, bigint, bigint, bigint, bigint, boolean];
  const ext = extended as readonly [bigint, bigint, bigint, bigint] | undefined;

  const stats = [
    { label: 'Referral Balance', value: `${formatUnits(basic[1], USDT_DECIMALS)} USDT`, icon: '💰' },
    { label: 'Total Buy', value: `${formatUnits(basic[2], USDT_DECIMALS)} USDT`, icon: '🛒' },
    { label: 'Total Sell', value: `${formatUnits(basic[3], USDT_DECIMALS)} USDT`, icon: '📤' },
    { label: 'Direct Count', value: basic[4].toString(), icon: '👥' },
    { label: 'Active Directs', value: basic[5].toString(), icon: '✅' },
    { label: 'Status', value: basic[6] ? 'Active' : 'Inactive', icon: basic[6] ? '🟢' : '⚪' },
  ];

  if (ext) {
    stats.push({ label: 'Daily Earned', value: `${formatUnits(ext[2], USDT_DECIMALS)} USDT`, icon: '📈' });
    stats.push({
      label: 'Active Until',
      value: ext[0] > 0n ? new Date(Number(ext[0]) * 1000).toLocaleDateString() : '—',
      icon: '📅',
    });
  }

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm">📊</span>
        <h3 className="text-lg font-semibold text-slate-800">Referral Stats</h3>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        {stats.map(s => (
          <div key={s.label} className="bg-gradient-to-b from-indigo-50/60 to-white border border-indigo-50 rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-medium text-slate-400">{s.label}</p>
              <span className="text-sm">{s.icon}</span>
            </div>
            <p className="font-semibold text-slate-800 text-sm mt-1.5">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

