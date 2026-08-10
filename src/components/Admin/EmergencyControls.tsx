import { useWriteContract } from 'wagmi';
import { CONTRACT_ADDRESS, PLP_ABI } from '../../constants';

export default function EmergencyControls() {
  const { writeContract, isPending } = useWriteContract();

  const handlePause = () => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PLP_ABI,
      functionName: 'pause',
      args: [],
    });
  };

  const handleUnpause = () => {
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PLP_ABI,
      functionName: 'unpause',
      args: [],
    });
  };

  return (
    <div className="card p-5 border-l-4 border-l-amber-400">
      <div className="flex items-center gap-2 mb-1">
        <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm">⚠️</span>
        <h3 className="font-semibold text-slate-800">Emergency Controls</h3>
      </div>
      <p className="text-xs text-slate-400 mb-3">Pause or unpause trading on the contract.</p>
      <div className="flex gap-3">
        <button
          onClick={handlePause}
          disabled={isPending}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-50 text-amber-600 border border-amber-200 hover:bg-amber-100 transition disabled:opacity-50 flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Pause
        </button>
        <button
          onClick={handleUnpause}
          disabled={isPending}
          className="px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-100 transition disabled:opacity-50 flex items-center gap-2"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Unpause
        </button>
      </div>
    </div>
  );
}
