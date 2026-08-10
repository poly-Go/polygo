import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESS, PLP_ABI, USDT_DECIMALS } from '../../constants';
import { parseUnits } from 'viem';
import { useToast } from '../../hooks/useToast';

export default function Withdraw() {
  const toast = useToast();
  const [amount, setAmount] = useState('');

  const { writeContract, isPending } = useWriteContract();

  const handleWithdraw = () => {
    if (!amount || isNaN(Number(amount))) {
      toast.error('Invalid Amount', 'Please enter a valid amount');
      return;
    }
    const amt = parseUnits(amount, USDT_DECIMALS);
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PLP_ABI,
      functionName: 'withdrawAdminPartial',
      args: [amt],
    });
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-sm">💸</span>
        <h3 className="font-semibold text-slate-800">Withdraw Admin Pool</h3>
      </div>
      <p className="text-xs text-slate-400 mb-3">Withdraw USDT from the admin fee pool.</p>
      <input
        type="number"
        placeholder="0.00 USDT"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        className="input-field"
      />
      <button onClick={handleWithdraw} disabled={isPending} className="btn-primary mt-3">
        {isPending ? 'Withdrawing...' : 'Withdraw'}
      </button>
    </div>
  );
}
