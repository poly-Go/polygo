import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESS, PLP_ABI } from '../../constants';
import { useToast } from '../../hooks/useToast';

export default function FeeSettings() {
  const toast = useToast();
  const [feeAdmin, setFeeAdmin] = useState('');
  const [feeReferral, setFeeReferral] = useState('');
  const [feeClaim, setFeeClaim] = useState('');

  const { writeContract, isPending } = useWriteContract();

  const handleUpdate = () => {
    const admin = parseInt(feeAdmin);
    const ref = parseInt(feeReferral);
    const claim = parseInt(feeClaim);
    if (isNaN(admin) || isNaN(ref) || isNaN(claim)) {
      toast.error('Invalid Input', 'Please enter valid fee values (basis points)');
      return;
    }
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PLP_ABI,
      functionName: 'updateFees',
      args: [BigInt(admin), BigInt(ref), BigInt(claim)],
    });
  };

  return (
    <div className="card p-5">
      <div className="flex items-center gap-2 mb-1">
        <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center text-white text-sm">⚙️</span>
        <h3 className="font-semibold text-slate-800">Fee Settings</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
        <div>
          <label className="label-text">Admin (bps)</label>
          <input
            placeholder="e.g. 200"
            value={feeAdmin}
            onChange={e => setFeeAdmin(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="label-text">Referral (bps)</label>
          <input
            placeholder="e.g. 100"
            value={feeReferral}
            onChange={e => setFeeReferral(e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="label-text">Claim (bps)</label>
          <input
            placeholder="e.g. 50"
            value={feeClaim}
            onChange={e => setFeeClaim(e.target.value)}
            className="input-field"
          />
        </div>
      </div>
      <button onClick={handleUpdate} disabled={isPending} className="btn-primary mt-4">
        {isPending ? 'Updating...' : 'Update Fees'}
      </button>
    </div>
  );
}
