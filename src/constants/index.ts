import rawAbi from "../abi/PolyGoNetwork.json";
import type { Abi } from "viem";

// ================= CONTRACT ADDRESSES =================
export const CONTRACT_ADDRESS = "0x7edE3BE88838cA6bD92560727cBFd235788195cE";
export const USDT_ADDRESS = "0xc2132D05D31c914a87C6611C10748AEb04B58e8F";
export const PLP_ADDRESS = "0x141435b6a29243e552dAe1d34A4C1bB785aA9b20";

// ================= CHAIN & NETWORK =================
export const CHAIN_ID = 137; // Polygon Mainnet
export const CHAIN_NAME = "Polygon";

// ✅ Multiple RPC URLs with fallbacks
export const RPC_URLS = [
  import.meta.env.VITE_RPC_URL || "https://polygon-rpc.com",
  "https://polygon-mainnet.g.alchemy.com/v2/demo",
  "https://rpc-mainnet.maticvigil.com",
  "https://rpc-mainnet.matic.network",
  "https://polygon.llamarpc.com",
  "https://polygon-mainnet.public.blastapi.io",
];

// ✅ Primary RPC URL (first one)
export const RPC_URL = RPC_URLS[0];

// ✅ Get random RPC URL for fallback
export const getRandomRPC = () => {
  return RPC_URLS[Math.floor(Math.random() * RPC_URLS.length)];
};

// ================= ABI =================
export const PLP_ABI = rawAbi as Abi;

// ================= DECIMALS =================
export const USDT_DECIMALS = 6;
export const PLP_DECIMALS = 18;

// ================= APP INFO =================
export const APP_NAME = "PolyGo Network";
export const PROJECT_ID = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID";

// ================= CONFIG (All Values in Wei) =================
export const STEP = 10 * 10**6; // 10 USDT (multiple of 10)

// Buy Limits
export const MIN_BUY = 1 * 10**6; // 1 USDT (minimum possible)
export const MAX_BUY = 1000 * 10**6; // 1000 USDT (maximum possible)

// Sell Limits
export const MIN_SELL_LIMIT = 1000 * 10**18; // 1000 PLP
export const MAX_SELL_LIMIT = 1010000 * 10**18; // 1,010,000 PLP

// Referral
export const MIN_BUY_FOR_BONUS = 10 * 10**6; // 10 USDT (bonus threshold)
export const MIN_CLAIM_AMOUNT = 10 * 10**6; // 10 USDT (min referral claim)
export const MAX_CLAIM_AMOUNT = 1000 * 10**6; // 1000 USDT (max referral claim)
export const MAX_REFERRAL_LEVELS = 10;
export const MAX_REFERRAL_PER_LEVEL = 1 * 10**6; // 1 USDT
export const MAX_REFERRAL_TOTAL = 10 * 10**6; // 10 USDT
export const DAILY_REFERRAL_CAP_USDT = 200 * 10**6; // 200 USDT
export const PER_LEG_DAILY_CAP_USDT = 100 * 10**6; // 100 USDT

// Settlement
export const SETTLEMENT_WAIT_TIME = 3 * 60; // 3 minutes in seconds
export const MAX_SETTLE_BATCH = 50;

// Admin Fees (in basis points: 1 = 0.01%)
export const ADMIN_FEE_PERCENT = 20; // 0.2%
export const REFERRAL_PERCENT = 100; // 1%
export const CLAIM_FEE_PERCENT = 500; // 5%

// ================= For backward compatibility =================
export const MIN_BUY_FOR_BONUS_WEI = MIN_BUY_FOR_BONUS;
export const MAX_BUY_AMOUNT_WEI = MAX_BUY;
export const MIN_SELL_WEI = MIN_SELL_LIMIT;