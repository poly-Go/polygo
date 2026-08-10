import { NavLink } from 'react-router-dom';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, PLP_ABI, CHAIN_ID } from '../../constants'; // ✅ Fixed path

export const BottomNav = () => {
  const { address, isConnected } = useAccount();

  // Check if connected user is the contract owner
  const { data: owner } = useReadContract({
    chainId: CHAIN_ID,
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: PLP_ABI,
    functionName: 'owner',
    query: { enabled: isConnected },
  });

  const isOwner = isConnected && owner && address?.toLowerCase() === (owner as string).toLowerCase();

  const items = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/marketplace', label: 'Marketplace', icon: '🛒' },
    { path: '/referral', label: 'Referral', icon: '👥' },
    { path: '/support', label: 'Support', icon: '❓' },
  ];

  // Add Admin item only if user is owner
  if (isOwner) {
    items.push({ path: '/admin', label: 'Admin', icon: '⚙️' });
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200 flex justify-around py-2 z-50">
      {items.map(({ path, label, icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${isActive ? 'text-indigo-600' : 'text-slate-400'} transition`
          }
        >
          <span className="text-xl">{icon}</span>
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
};