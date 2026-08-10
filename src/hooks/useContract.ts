import { useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { CONTRACT_ADDRESS, PLP_ABI } from '../constants';
import { useToast } from './useToast';

export const usePolyGoContract = () => {
  const { address } = useAccount();
  const toast = useToast();

  const { writeContract, data: writeData, isPending, error: writeError } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash: writeData,
  });

  // Show toast on success/error
  useEffect(() => {
    if (isSuccess) {
      toast.success('Transaction Successful', 'Transaction confirmed on chain.', undefined, writeData);
    }
  }, [isSuccess, writeData, toast]);

  useEffect(() => {
    if (writeError) {
      toast.error('Transaction Failed', writeError.message);
    }
  }, [writeError, toast]);

  // Generic read
  const read = (functionName: string, args: readonly unknown[] = []) => {
    return useReadContract({
      address: CONTRACT_ADDRESS,
      abi: PLP_ABI,
      functionName: functionName as any,
      args,
    });
  };

  // Generic write
  const write = (functionName: string, args: readonly unknown[] = []) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: PLP_ABI,
      functionName: functionName as any,
      args,
    });
  };

  return { write, read, address, isPending, isConfirming, isSuccess, writeData, writeError };
};
