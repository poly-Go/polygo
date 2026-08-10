# TODO - Token Name Change: PGN → PLP

## Steps (All Completed ✅)
- [x] 1. Rename constants in `src/constants/index.ts` (PGN_ADDRESS→PLP_ADDRESS, PGN_ABI→PLP_ABI, PGN_DECIMALS→PLP_DECIMALS)
- [x] 2. Update `src/utils/validation.ts` (PGN → PLP strings)
- [x] 3. Update `src/hooks/useToast.ts` (PGN → PLP strings)
- [x] 4. Update `src/hooks/useContract.ts` (PGN_ABI → PLP_ABI)
- [x] 5. Update `src/components/Home/BalanceCard.tsx`
- [x] 6. Update `src/components/Home/ConnectButton.tsx` (if any)
- [x] 7. Update `src/components/Marketplace/BuySell.tsx`
- [x] 8. Update `src/components/Marketplace/Orders.tsx`
- [x] 9. Update `src/pages/Home.tsx`
- [x] 10. Update `src/pages/Referral.tsx`
- [x] 11. Update `src/pages/Marketplace.tsx`
- [x] 12. Update `src/pages/Support.tsx`
- [x] 13. Update `src/components/Layout/Header.tsx`
- [x] 14. Update `src/components/Layout/BottomNav.tsx`
- [x] 15. Update `src/components/Layout/AdminRoute.tsx`
- [x] 16. Update `src/components/Admin/AdminPanel.tsx` (kept emergencyMintPGN contract function)
- [x] 17. Update `src/components/Admin/FeeSettings.tsx`
- [x] 18. Update `src/components/Admin/Withdraw.tsx`
- [x] 19. Update `src/components/Admin/LimitSettings.tsx`
- [x] 20. Update `src/components/Admin/EmergencyControls.tsx`
- [x] 21. Update `src/components/Referral/ReferralList.tsx`
- [x] 22. Update `src/components/Referral/ReferralStats.tsx`
- [x] 23. Update `src/components/Referral/ClaimReferral.tsx`
- [x] 24. Update `README.md`
- [x] 25. Verify - All PGN/pgn renamed to PLP/plp. Only `emergencyMintPGN` contract function kept (deployed on-chain name cannot change without redeploy).

## Note
- TS errors in Home.tsx, Web3Context.tsx, Referral.tsx, Orders.tsx, AdminPanel.tsx are **pre-existing** and unrelated to this rename.
