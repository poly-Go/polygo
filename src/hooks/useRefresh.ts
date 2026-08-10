import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { useToast } from './useToast';

export const useRefresh = () => {
  const queryClient = useQueryClient();
  const toast = useToast();

  // ✅ Refresh everything (with toast - for manual refresh)
  const refreshAll = useCallback(async () => {
    await queryClient.invalidateQueries();
    toast.success('🔄 Refreshed', 'All data updated');
  }, [queryClient, toast]);

  // ✅ Refresh everything (silent - no toast for auto-refresh)
  const refreshAllSilent = useCallback(async () => {
    await queryClient.invalidateQueries();
  }, [queryClient]);

  // ✅ Refresh balances (with toast - for manual)
  const refreshBalances = useCallback(async (address?: string) => {
    if (address) {
      await queryClient.invalidateQueries({ 
        queryKey: ['balanceOf', address] 
      });
    } else {
      await queryClient.invalidateQueries({ 
        queryKey: ['balanceOf'] 
      });
    }
    toast.success('💰 Updated', 'Balances refreshed');
  }, [queryClient, toast]);

  // ✅ Refresh balances (silent - for auto-refresh)
  const refreshBalancesSilent = useCallback(async (address?: string) => {
    if (address) {
      await queryClient.invalidateQueries({ 
        queryKey: ['balanceOf', address] 
      });
    } else {
      await queryClient.invalidateQueries({ 
        queryKey: ['balanceOf'] 
      });
    }
  }, [queryClient]);

  // ✅ Refresh user info (with toast - for manual)
  const refreshUserInfo = useCallback(async (address: string) => {
    await queryClient.invalidateQueries({ 
      queryKey: ['getUserBasicInfo', address] 
    });
    await queryClient.invalidateQueries({ 
      queryKey: ['getUserExtendedInfo', address] 
    });
    await queryClient.invalidateQueries({ 
      queryKey: ['pendingSettlement', address] 
    });
    toast.success('👤 Updated', 'User data refreshed');
  }, [queryClient, toast]);

  // ✅ Refresh user info (silent - for auto-refresh)
  const refreshUserInfoSilent = useCallback(async (address: string) => {
    await queryClient.invalidateQueries({ 
      queryKey: ['getUserBasicInfo', address] 
    });
    await queryClient.invalidateQueries({ 
      queryKey: ['getUserExtendedInfo', address] 
    });
    await queryClient.invalidateQueries({ 
      queryKey: ['pendingSettlement', address] 
    });
  }, [queryClient]);

  // ✅ Refresh orders (with toast - for manual)
  const refreshOrders = useCallback(async () => {
    await queryClient.invalidateQueries({ 
      queryKey: ['getSellQueueLength'] 
    });
    await queryClient.invalidateQueries({ 
      queryKey: ['queueStart'] 
    });
    await queryClient.invalidateQueries({ 
      queryKey: ['getPendingSellOrders'] 
    });
    toast.success('📊 Updated', 'Orders refreshed');
  }, [queryClient, toast]);

  // ✅ Refresh orders (silent - for auto-refresh)
  const refreshOrdersSilent = useCallback(async () => {
    await queryClient.invalidateQueries({ 
      queryKey: ['getSellQueueLength'] 
    });
    await queryClient.invalidateQueries({ 
      queryKey: ['queueStart'] 
    });
    await queryClient.invalidateQueries({ 
      queryKey: ['getPendingSellOrders'] 
    });
  }, [queryClient]);

  // ✅ Refresh after trade (SILENT - NO TOAST)
  const refreshAfterTrade = useCallback(async (address: string) => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['balanceOf', address] }),
      queryClient.invalidateQueries({ queryKey: ['getUserBasicInfo', address] }),
      queryClient.invalidateQueries({ queryKey: ['getUserExtendedInfo', address] }),
      queryClient.invalidateQueries({ queryKey: ['pendingSettlement', address] }),
      queryClient.invalidateQueries({ queryKey: ['getSellQueueLength'] }),
      queryClient.invalidateQueries({ queryKey: ['queueStart'] }),
    ]);
    // ✅ REMOVED toast from here
  }, [queryClient]);

  return {
    // With toast (manual)
    refreshAll,
    refreshBalances,
    refreshUserInfo,
    refreshOrders,
    
    // Silent (auto-refresh - NO toast)
    refreshAllSilent,
    refreshBalancesSilent,
    refreshUserInfoSilent,
    refreshOrdersSilent,
    refreshAfterTrade, // ✅ Now SILENT
  };
};