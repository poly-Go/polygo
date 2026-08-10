import { useMemo } from 'react';
import { useNotification } from '../context/NotificationContext';

export const useToast = () => {
  const { showToast, hideToast } = useNotification();

  return useMemo(() => ({
    hide: hideToast,

    // ===== GENERIC =====
    success: (title: string, message: string, bonus?: string, txHash?: string) =>
      showToast({ type: 'success', title, message, bonus, txHash }),
    error: (title: string, message: string, txHash?: string) =>
      showToast({ type: 'error', title, message, txHash }),
    info: (title: string, message: string, txHash?: string) =>
      showToast({ type: 'info', title, message, txHash }),
    pending: (title: string, message: string, txHash?: string) =>
      showToast({ type: 'pending', title, message, txHash }),

    // ===== BUY =====
    buySuccess: (amount: string, token: string = 'PLP', bonus?: number) =>
      showToast({
        type: 'success',
        title: '🚀 Purchase Successful',
        message: `You bought ${amount} USDT worth of ${token} tokens.`,
        bonus: bonus ? `+${bonus.toLocaleString()} ${token} Bonus` : undefined,
      }),
    buyError: () =>
      showToast({
        type: 'error',
        title: '❌ Purchase Failed',
        message: 'Buy failed. Please check your USDT balance and try again.',
      }),
    buyPending: () =>
      showToast({
        type: 'pending',
        title: '⏳ Processing Buy',
        message: 'Processing your buy order... Please wait.',
      }),
    buyApproval: () =>
      showToast({
        type: 'pending',
        title: '📝 Approving USDT',
        message: 'Please approve USDT in your wallet.',
      }),

    // ===== SELL =====
    sellSuccess: (amount: string) =>
      showToast({
        type: 'success',
        title: '📤 Sell Order Placed',
        message: `Sell order placed for ${amount} PLP.`,
      }),
    sellError: () =>
      showToast({
        type: 'error',
        title: '❌ Sell Failed',
        message: 'Sell failed. Please check your PLP balance.',
      }),
    sellPending: () =>
      showToast({
        type: 'pending',
        title: '⏳ Processing Sell',
        message: 'Processing your sell order... Please wait.',
      }),
    sellApproval: () =>
      showToast({
        type: 'pending',
        title: '📝 Approving PLP',
        message: 'Please approve PLP in your wallet.',
      }),

    // ===== SETTLEMENT =====
    settlementSuccess: (amount: string) =>
      showToast({
        type: 'success',
        title: '💰 Settlement Claimed',
        message: `Settlement claimed successfully!`,
        bonus: `+${amount} USDT Received`,
      }),
    settlementError: () =>
      showToast({
        type: 'error',
        title: '❌ Settlement Failed',
        message: 'Settlement claim failed. Insufficient liquidity.',
      }),
    settlementPending: () =>
      showToast({
        type: 'pending',
        title: '⏳ Processing Settlement',
        message: 'Processing your settlement claim... Please wait.',
      }),
    settlementReady: (count: number) =>
      showToast({
        type: 'info',
        title: '✅ Orders Ready',
        message: `${count} order${count > 1 ? 's' : ''} ready to settle!`,
      }),
    settlementClaimed: () =>
      showToast({
        type: 'success',
        title: '✅ Settlement Executed',
        message: 'Settlement executed successfully!',
      }),

    // ===== REFERRAL =====
    referralSuccess: (amount: string) =>
      showToast({
        type: 'success',
        title: '👥 Referral Reward!',
        message: 'Your friend joined using your referral link.',
        bonus: `+${amount} USDT Referral Bonus`,
      }),
    referralError: () =>
      showToast({
        type: 'error',
        title: '❌ Referral Claim Failed',
        message: 'Referral claim failed. Minimum 10 USDT required.',
      }),
    referralPending: () =>
      showToast({
        type: 'pending',
        title: '⏳ Claiming Referral',
        message: 'Processing your referral claim... Please wait.',
      }),
    referralLinkCopied: () =>
      showToast({
        type: 'success',
        title: '📋 Link Copied',
        message: 'Referral link copied to clipboard!',
      }),

    // ===== WALLET =====
    walletConnected: () =>
      showToast({
        type: 'success',
        title: '🔗 Wallet Connected',
        message: 'Wallet connected successfully to Polygon Mainnet.',
      }),
    walletDisconnected: () =>
      showToast({
        type: 'info',
        title: '👋 Wallet Disconnected',
        message: 'Your wallet has been disconnected.',
      }),
    walletWrongNetwork: () =>
      showToast({
        type: 'error',
        title: '⚠️ Wrong Network',
        message: 'Please switch to Polygon Mainnet to continue.',
      }),

    // ===== REGISTER =====
    registerSuccess: () =>
      showToast({
        type: 'success',
        title: '🎉 Welcome Aboard!',
        message: 'Your account has been registered successfully.',
        bonus: '+500 PLP Welcome Bonus',
      }),
    registerError: () =>
      showToast({
        type: 'error',
        title: '❌ Registration Failed',
        message: 'Registration failed. Please try again.',
      }),
    registerPending: () =>
      showToast({
        type: 'pending',
        title: '⏳ Registering Account',
        message: 'Processing your registration... Please wait.',
      }),

    // ===== ADMIN =====
    adminFeesUpdated: () =>
      showToast({
        type: 'success',
        title: '📊 Fees Updated',
        message: 'Fees updated successfully!',
      }),
    adminWithdraw: (amount: string) =>
      showToast({
        type: 'success',
        title: '🏦 Withdrawal Successful',
        message: `Withdrew ${amount} USDT from admin pool.`,
      }),
    adminPaused: () =>
      showToast({
        type: 'info',
        title: '⏸️ Contract Paused',
        message: 'All functions have been paused.',
      }),
    adminUnpaused: () =>
      showToast({
        type: 'info',
        title: '▶️ Contract Unpaused',
        message: 'All functions have been resumed.',
      }),
    adminEmergencyMint: (amount: string) =>
      showToast({
        type: 'success',
        title: '🆘 Emergency Mint',
        message: `Emergency minted ${amount} PLP.`,
      }),
    adminLimitsUpdated: () =>
      showToast({
        type: 'success',
        title: '⚙️ Limits Updated',
        message: 'Buy/Sell limits updated successfully.',
      }),
    adminSettleTimeUpdated: () =>
      showToast({
        type: 'success',
        title: '⏱️ Wait Time Updated',
        message: 'Settlement wait time updated successfully.',
      }),

    // ===== GENERAL =====
    refresh: () =>
      showToast({
        type: 'success',
        title: '🔄 Refreshed',
        message: 'Data refreshed successfully!',
      }),
    generalError: () =>
      showToast({
        type: 'error',
        title: '❌ Error',
        message: 'Something went wrong. Please try again.',
      }),
    generalSuccess: () =>
      showToast({
        type: 'success',
        title: '✅ Success',
        message: 'Operation completed successfully!',
      }),
    approvalSuccess: () =>
      showToast({
        type: 'success',
        title: '✅ Approval Successful',
        message: 'Token approval successful!',
      }),
    approvalFailed: () =>
      showToast({
        type: 'error',
        title: '❌ Approval Failed',
        message: 'Token approval failed. Please try again.',
      }),
    txConfirmed: (hash: string) =>
      showToast({
        type: 'success',
        title: '✅ Transaction Confirmed',
        message: 'Transaction confirmed on chain.',
        txHash: hash,
      }),
    txFailed: () =>
      showToast({
        type: 'error',
        title: '❌ Transaction Failed',
        message: 'Transaction failed. Please try again.',
      }),

    // ===== CUSTOM =====
    custom: (
      type: 'success' | 'error' | 'info' | 'pending',
      title: string,
      message: string,
      bonus?: string,
      txHash?: string
    ) => showToast({ type, title, message, bonus, txHash }),
  }), [showToast, hideToast]);
};