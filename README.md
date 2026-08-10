# PolyGo Network dApp

A decentralized P2P liquidity marketplace built with **Reown AppKit (formerly WalletConnect)**, **wagmi v3**, **viem**, and **React**.

## Features

- 🌐 **Wallet Connection** via Reown AppKit (WalletConnect, injected wallets)
- 💰 **Balance Dashboard** – PLP, USDT, and Referral balances
- 🛒 **Marketplace** – Buy PLP with USDT, Sell PLP, and settle/cancel orders
- 👥 **Referral Program** – Referral link generation, stats, and claim
- ⚙️ **Admin Panel** – Fee settings, withdrawals, limits, emergency controls, notifications
- 🔔 **Notifications** – Toast system + global popup

## Tech Stack

- [@reown/appkit@1.8.23](https://reown.com/appkit) + `@reown/appkit-adapter-wagmi@1.8.23`
- [wagmi@3.7.4](https://wagmi.sh) + [viem@2.55.10](https://viem.sh)
- [@tanstack/react-query@5.101.2](https://tanstack.com/query)
- React 18 + React Router 6 + Vite + Tailwind CSS

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Configure the app
#  - Edit src/constants/index.ts:
#    * CONTRACT_ADDRESS → your deployed PolyGoNetwork contract
#    * CHAIN_ID → 1 (mainnet) or 31337 (Hardhat)
#    * PROJECT_ID → your Reown/WalletConnect Cloud project ID (cloud.reown.com)
#  - Replace src/abi/PolyGoNetwork.json with your real compiled contract ABI

# 3. Run dev server
npm run dev

# 4. Build for production
npm run build
```

## Project Structure

```
polygo-dapp/
├── public/logo.png|svg
├── src/
│   ├── abi/            # Contract ABI + ERC20 ABI
│   ├── constants/      # Config (address, chains, project ID)
│   ├── context/        # Web3Provider (AppKit+Wagmi), NotificationContext
│   ├── hooks/          # useContract, useToast
│   ├── components/     # Layout, Home, Marketplace, Referral, Admin, common
│   ├── pages/          # Home, Marketplace, Referral, Support
│   ├── App.tsx         # Root (providers + layout + routes)
│   └── main.tsx        # Entry
```

## Admin Route

The `/admin` route is protected by `AdminRoute` — only the deployed contract owner can access it.

## Important Note

The included `src/abi/PolyGoNetwork.json` is a **reconstructed ABI** covering all functions referenced by the UI. **Replace it with the actual compiled ABI artifact** from your Solidity contract (`artifacts/PolyGoNetwork.json`) before interacting with a real deployment.
