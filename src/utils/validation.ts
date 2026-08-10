import { formatUnits } from 'viem';

// ─── TRADE LIMITS ───
export const TRADE_LIMITS = {
  BUY: {
    MIN: 10,      // USDT
    MAX: 100,     // USDT
  },
  SELL: {
    MIN: 10000,   // PLP (10 USDT worth)
    MAX: 100000,  // PLP (100 USDT worth)
  },
  SETTLEMENT: {
    MIN: 0,       // Minimum claim amount
  },
  REFERRAL: {
    MIN_CLAIM: 10, // USDT
  }
};

// ─── TYPES ───
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  firstError: string | null;
}

// ─── BUY VALIDATION ───
export const validateBuy = (
  amount: string,
  min: number = TRADE_LIMITS.BUY.MIN,
  max: number = TRADE_LIMITS.BUY.MAX
): ValidationResult => {
  const errors: string[] = [];
  const numAmount = parseFloat(amount);

  if (!amount || amount.trim() === '' || isNaN(numAmount) || numAmount <= 0) {
    errors.push('Please enter a valid amount');
  }
  if (!isNaN(numAmount) && numAmount < min) {
    errors.push(`Minimum buy is ${min} USDT`);
  }
  if (!isNaN(numAmount) && numAmount > max) {
    errors.push(`Maximum buy is ${max} USDT`);
  }
  if (!isNaN(numAmount) && numAmount > 0 && numAmount % 1 !== 0) {
    errors.push('Amount must be a whole number');
  }

  return {
    isValid: errors.length === 0,
    errors,
    firstError: errors[0] || null,
  };
};

// ─── SELL VALIDATION ───
export const validateSell = (
  amount: string,
  min: number = TRADE_LIMITS.SELL.MIN,
  max: number = TRADE_LIMITS.SELL.MAX,
  plpBalance?: bigint,
  decimals?: number
): ValidationResult => {
  const errors: string[] = [];
  const numAmount = parseFloat(amount);

  if (!amount || amount.trim() === '' || isNaN(numAmount) || numAmount <= 0) {
    errors.push('Please enter a valid amount');
  }
  if (!isNaN(numAmount) && numAmount < min) {
    errors.push(`Minimum sell is ${min.toLocaleString()} PLP (${TRADE_LIMITS.BUY.MIN} USDT)`);
  }
  if (!isNaN(numAmount) && numAmount > max) {
    errors.push(`Maximum sell is ${max.toLocaleString()} PLP (${TRADE_LIMITS.BUY.MAX} USDT)`);
  }
  if (!isNaN(numAmount) && numAmount > 0 && numAmount % 1 !== 0) {
    errors.push('Amount must be a whole number');
  }
  if (plpBalance !== undefined && plpBalance !== null && decimals) {
    const balance = Number(formatUnits(plpBalance, decimals));
    if (numAmount > balance) {
      errors.push(`Insufficient balance. You have ${balance.toFixed(2)} PLP`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    firstError: errors[0] || null,
  };
};

// ─── SETTLEMENT VALIDATION ───
export const validateSettlement = (claimableAmount: bigint): ValidationResult => {
  const errors: string[] = [];

  if (!claimableAmount || claimableAmount <= 0n) {
    errors.push('No settlement amount available to claim');
  }

  return {
    isValid: errors.length === 0,
    errors,
    firstError: errors[0] || null,
  };
};

// ─── REFERRAL VALIDATION (bigint) ───
export const validateReferralClaim = (referralAmount: bigint): ValidationResult => {
  const errors: string[] = [];

  if (!referralAmount || referralAmount <= 0n) {
    errors.push('No referral rewards available');
  }

  return {
    isValid: errors.length === 0,
    errors,
    firstError: errors[0] || null,
  };
};

// ─── REFERRAL VALIDATION (formatted USDT string + min claim) ───
export const validateReferralClaimByString = (
  referralAmountUsdt: string,
  minClaim: number = TRADE_LIMITS.REFERRAL.MIN_CLAIM
): ValidationResult => {
  const errors: string[] = [];
  const numAmount = parseFloat(referralAmountUsdt);

  if (!referralAmountUsdt || isNaN(numAmount) || numAmount <= 0) {
    errors.push('No referral rewards available');
  }
  if (!isNaN(numAmount) && numAmount > 0 && numAmount < minClaim) {
    errors.push(`Minimum claim is ${minClaim} USDT`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    firstError: errors[0] || null,
  };
};

// ─── GENERIC AMOUNT VALIDATION ───
export const validateAmount = (
  amount: string,
  min: number,
  max: number,
  label: string = 'Amount'
): ValidationResult => {
  const errors: string[] = [];
  const numAmount = parseFloat(amount);

  if (!amount || amount.trim() === '' || isNaN(numAmount) || numAmount <= 0) {
    errors.push(`Please enter a valid ${label}`);
  }
  if (!isNaN(numAmount) && numAmount < min) {
    errors.push(`${label} must be at least ${min}`);
  }
  if (!isNaN(numAmount) && numAmount > max) {
    errors.push(`${label} must not exceed ${max}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    firstError: errors[0] || null,
  };
};

// ─── REUSABLE HOOK ───
export const useValidation = () => {
  return {
    validateBuy,
    validateSell,
    validateSettlement,
    validateReferralClaim,
    validateReferralClaimByString,
    validateAmount,
    TRADE_LIMITS,
  };
};
