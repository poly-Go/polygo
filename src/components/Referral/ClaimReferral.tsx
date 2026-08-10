import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { CONTRACT_ADDRESS, PLP_ABI, USDT_DECIMALS } from '../../constants';
import { formatUnits } from 'viem';
import { useReadContract } from 'wagmi';
import { useEffect } from 'react';
import { useToast } from '../../hooks/useToast';
import { validateReferralClaimByString, TRADE_LIMITS } from '../../utils/validation';


export const ClaimReferral = () => {
  const { address } = useAccount();
  const toast = useToast();

  const { data: userBasic, refetch: refetchBasic } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'getUserBasicInfo',
    args: [address as `0x${string}`],
    query: { enabled: !!address },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isSuccess } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    if (isSuccess) {
      toast.referralSuccess('0');
      refetchBasic();
    }
  }, [isSuccess, toast, refetchBasic]);

const handleClaim = () => {
    if (!address) return;
    const referralValidation = validateReferralClaimByString(referralBalanceFormatted, TRADE_LIMITS.REFERRAL.MIN_CLAIM);
    if (!referralValidation.isValid) {
      toast.error('Cannot Claim', referralValidation.firstError || 'Insufficient referral rewards');
      return;
    }
    writeContract({
      address: CONTRACT_ADDRESS as `0x${string}`,
      abi: PLP_ABI,
      functionName: 'claimReferral',
      args: [],
    });
  };

const referralBalance = userBasic ? (userBasic as readonly [string, bigint, bigint, bigint, bigint, bigint, boolean])[1] : 0n;
  const referralBalanceFormatted = formatUnits(referralBalance, USDT_DECIMALS);
  const referralValidation = validateReferralClaimByString(referralBalanceFormatted, TRADE_LIMITS.REFERRAL.MIN_CLAIM);

  return (
    <div className="card p-5 relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-fuchsia-500"></div>
      <div className="flex items-center gap-2 mb-1">
        <span className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-sm">🎁</span>
        <h3 className="text-lg font-semibold text-slate-800">Claim Referral Earnings</h3>
      </div>
<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
        <div>
          <p className="text-xs text-slate-400">Available balance</p>
          <p className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {referralBalanceFormatted} USDT
          </p>
          {Number(referralBalance) > 0 && !referralValidation.isValid && (
            <p className="text-[11px] font-medium text-rose-600 mt-1">
              {referralValidation.firstError}
            </p>
          )}
        </div>
        <button
          onClick={handleClaim}
          disabled={!referralValidation.isValid || isPending}
          className="btn-primary"
        >
          {isPending ? (
            <>
              <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Claiming...
            </>
          ) : (
            'Claim Referral'
          )}
        </button>
      </div>
    </div>
  );
};

