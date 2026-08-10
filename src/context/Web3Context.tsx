import { ReactNode, useEffect } from 'react';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { PROJECT_ID, APP_NAME, RPC_URL } from '../constants';

// ✅ Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0,
      gcTime: 1000 * 60 * 5,
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
  },
});

const wagmiAdapter = new WagmiAdapter({
  networks: [polygon],
  projectId: PROJECT_ID,
});

const config = createConfig({
  chains: [polygon],
  transports: { [polygon.id]: http(RPC_URL) },
  connectors: wagmiAdapter.connectors as any,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks: [polygon],
  projectId: PROJECT_ID,
  metadata: { name: APP_NAME, description: 'PolyGo dApp', url: window.location.origin, icons: [] },
  themeMode: 'light',
});

// ✅ AutoRefresher Component (moved to separate file later)
// For now, we'll remove it from here and add it in App.tsx

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  // ✅ Network/Account change listener
  useEffect(() => {
    const handleChange = () => {
      window.location.reload();
    };

if (window.ethereum) {
      const eth = window.ethereum as any;
      eth.on('accountsChanged', handleChange);
      eth.on('chainChanged', handleChange);
    }

    return () => {
      if (window.ethereum) {
        const eth = window.ethereum as any;
        eth.removeListener('accountsChanged', handleChange);
        eth.removeListener('chainChanged', handleChange);
      }
    };
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};