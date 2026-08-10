import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAccount } from 'wagmi';
import { useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, PLP_ABI } from '../../constants';

export const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { address, isConnected } = useAccount();

  const { data: owner } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'owner',
  });

  const isOwner = isConnected && address && owner && address.toLowerCase() === (owner as string).toLowerCase();

  if (!isOwner) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
