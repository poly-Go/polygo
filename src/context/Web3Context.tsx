import { ReactNode } from 'react';
import { WagmiProvider, createConfig, http, fallback } from 'wagmi';
import { polygon } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { PROJECT_ID, APP_NAME, RPC_URLS } from '../constants';

// ✅ Optimized Query Client Settings
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retry: 1,
      retryDelay: 1000,
      networkMode: 'online',
    },
  },
});

// ✅ Wagmi Adapter
const wagmiAdapter = new WagmiAdapter({
  networks: [polygon],
  projectId: PROJECT_ID,
});

// ✅ Config with fallback RPCs - REMOVED batch.multicall
const config = createConfig({
  chains: [polygon],
  transports: {
    [polygon.id]: fallback(
      RPC_URLS.map(url => http(url, {
        // ✅ REMOVED: batch: { multicall: true }
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
  enableWalletConnect: true,
  enableCoinbase: false,
  enableInjected: true,
});

export const Web3Provider = ({ children }: { children: ReactNode }) => {
  // ❌ REMOVED - No window.location.reload()

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
};