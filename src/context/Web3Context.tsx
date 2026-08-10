import { ReactNode } from 'react';
import { WagmiProvider, createConfig, http, fallback } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { PROJECT_ID, APP_NAME, RPC_URLS } from '../constants';

// ✅ Production Query Client Settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false, // ❌ NO auto-refetch on focus
      refetchOnReconnect: false, // ❌ NO auto-refetch on reconnect
      refetchOnMount: false, // ❌ NO auto-refetch on mount
      retry: 1,
      retryDelay: 1000,
    },
  },
});

// ✅ Wagmi Adapter with fallback RPCs
const wagmiAdapter = new WagmiAdapter({
  networks: [polygon],
  projectId: PROJECT_ID,
});

// ✅ Config with fallback RPCs
const config = createConfig({
  chains: [polygon],
  transports: {
    [polygon.id]: fallback(
      RPC_URLS.map(url => http(url, {
        batch: {
          multicall: true,
        },
        retryCount: 2,
        retryDelay: 1000,
        timeout: 30000,
      }))
    ),
  },
  connectors: wagmiAdapter.connectors as any,
});

// ✅ AppKit
createAppKit({
  adapters: [wagmiAdapter],
  networks: [polygon],
  projectId: PROJECT_ID,
  metadata: {
    name: APP_NAME,
    description: 'PolyGo dApp',
    url: window.location.origin,
    icons: [],
  },
  themeMode: 'light',
});

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  // ❌ REMOVED - No window.location.reload()
  // Wagmi automatically handles account/chain changes

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};