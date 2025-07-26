import { useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from '@aptos-labs/wallet-adapter-react';
import { useWebSocket } from './useWebSocket';

export interface BalanceData {
  // Wallet balances
  totalBalance: number;
  availableBalance: number;
  stakedBalance: number;
  
  // Reward balances
  pendingRewards: number;
  claimableRewards: number;
  totalEarnedRewards: number;
  totalClaimedRewards: number;
  
  // Metadata
  lastUpdated: Date;
  isStale: boolean;
}

export interface UseBalanceOptions {
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
  includeRewards?: boolean;
  onBalanceChange?: (balance: BalanceData) => void;
  onError?: (error: Error) => void;
}

export interface UseBalanceReturn {
  balance: BalanceData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isConnected: boolean;
  isStale: boolean;
}

const CACHE_KEY = 'cotrain_balance_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export const useBalance = (options: UseBalanceOptions = {}): UseBalanceReturn => {
  const {
    autoRefresh = true,
    refreshInterval = 30,
    includeRewards = true,
    onBalanceChange,
    onError,
  } = options;

  const { account, connected } = useWallet();
  const { connected: wsConnected } = useWebSocket();
  
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastFetchTimeRef = useRef<number>(0);

  // Load cached balance
  const loadCachedBalance = useCallback(() => {
    if (!account?.address) return null;
    
    try {
      const cached = localStorage.getItem(`${CACHE_KEY}_${account.address}`);
      if (!cached) return null;
      
      const { data, timestamp } = JSON.parse(cached);
      const age = Date.now() - timestamp;
      
      if (age > CACHE_EXPIRY) {
        localStorage.removeItem(`${CACHE_KEY}_${account.address}`);
        return null;
      }
      
      return {
        ...data,
        lastUpdated: new Date(data.lastUpdated),
        isStale: age > refreshInterval * 1000,
      };
    } catch (error) {
      console.warn('Failed to load cached balance:', error);
      return null;
    }
  }, [account?.address, refreshInterval]);

  // Save balance to cache
  const saveBalanceToCache = useCallback((balanceData: BalanceData) => {
    if (!account?.address) return;
    
    try {
      const cacheData = {
        data: balanceData,
        timestamp: Date.now(),
      };
      localStorage.setItem(`${CACHE_KEY}_${account.address}`, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to save balance to cache:', error);
    }
  }, [account?.address]);

  // Fetch balance from API
  const fetchBalance = useCallback(async (showLoading = true): Promise<BalanceData | null> => {
    if (!account?.address) return null;
    
    // Prevent too frequent requests
    const now = Date.now();
    if (now - lastFetchTimeRef.current < 5000) {
      return balance;
    }
    lastFetchTimeRef.current = now;

    try {
      if (showLoading) setLoading(true);
      setError(null);
      setIsStale(false);

      // Fetch wallet balance
      const walletResponse = await fetch(`/api/blockchain/balance/${account.address}`);
      if (!walletResponse.ok) {
        throw new Error(`Wallet balance fetch failed: ${walletResponse.statusText}`);
      }
      const walletData = await walletResponse.json();

      let rewardData = {
        pendingRewards: 0,
        claimableRewards: 0,
        totalEarnedRewards: 0,
        totalClaimedRewards: 0,
      };

      // Fetch reward balance if enabled
      if (includeRewards) {
        try {
          const rewardResponse = await fetch(`/api/blockchain/rewards/${account.address}/stats`);
          if (rewardResponse.ok) {
            const rewardStats = await rewardResponse.json();
            rewardData = {
              pendingRewards: rewardStats.totalPending || 0,
              claimableRewards: rewardStats.totalClaimable || 0,
              totalEarnedRewards: rewardStats.totalEarned || 0,
              totalClaimedRewards: rewardStats.totalClaimed || 0,
            };
          }
        } catch (rewardError) {
          console.warn('Failed to fetch reward data:', rewardError);
          // Continue with wallet data only
        }
      }

      const balanceData: BalanceData = {
        totalBalance: walletData.totalBalance || 0,
        availableBalance: walletData.availableBalance || 0,
        stakedBalance: walletData.stakedBalance || 0,
        ...rewardData,
        lastUpdated: new Date(),
        isStale: false,
      };

      setBalance(balanceData);
      saveBalanceToCache(balanceData);
      onBalanceChange?.(balanceData);
      
      return balanceData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balance';
      console.error('Balance fetch error:', errorMessage);
      setError(errorMessage);
      onError?.(err instanceof Error ? err : new Error(errorMessage));
      
      // Try to use cached data on error
      const cachedBalance = loadCachedBalance();
      if (cachedBalance) {
        setBalance({ ...cachedBalance, isStale: true });
        setIsStale(true);
        return cachedBalance;
      }
      
      return null;
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [account?.address, includeRewards, balance, onBalanceChange, onError, loadCachedBalance, saveBalanceToCache]);

  // Public refresh function
  const refresh = useCallback(async () => {
    await fetchBalance(true);
  }, [fetchBalance]);

  // Setup auto-refresh
  const setupAutoRefresh = useCallback(() => {
    if (!autoRefresh || !connected || !account) return;

    // Clear existing timeout
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }

    // Set up periodic refresh
    refreshTimeoutRef.current = setTimeout(() => {
      fetchBalance(false); // Don't show loading on auto-refresh
      setupAutoRefresh(); // Schedule next refresh
    }, refreshInterval * 1000);
  }, [autoRefresh, connected, account, refreshInterval, fetchBalance]);

  // Initial load
  useEffect(() => {
    if (!connected || !account) {
      setBalance(null);
      setError(null);
      setIsStale(false);
      return;
    }

    // Try to load cached data first
    const cachedBalance = loadCachedBalance();
    if (cachedBalance) {
      setBalance(cachedBalance);
      setIsStale(cachedBalance.isStale);
    }

    // Fetch fresh data
    fetchBalance(!cachedBalance); // Show loading only if no cached data
  }, [connected, account, fetchBalance, loadCachedBalance]);

  // Setup auto-refresh when conditions change
  useEffect(() => {
    setupAutoRefresh();
    
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [setupAutoRefresh]);

  // Listen for WebSocket balance updates
  useEffect(() => {
    if (!wsConnected || !account) return;

    // This would be implemented when WebSocket events are properly set up
    // For now, we'll just refresh on WebSocket connection
    const handleWebSocketUpdate = () => {
      fetchBalance(false);
    };

    // Listen for transaction confirmations or reward updates
    // wsConnection.on('balanceUpdate', handleWebSocketUpdate);
    // wsConnection.on('rewardUpdate', handleWebSocketUpdate);
    
    return () => {
      // Cleanup WebSocket listeners
      // wsConnection.off('balanceUpdate', handleWebSocketUpdate);
      // wsConnection.off('rewardUpdate', handleWebSocketUpdate);
    };
  }, [wsConnected, account, fetchBalance]);

  // Mark data as stale if connection is lost
  useEffect(() => {
    if (!connected && balance) {
      setIsStale(true);
    }
  }, [connected, balance]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  return {
    balance: balance ? { ...balance, isStale } : null,
    loading,
    error,
    refresh,
    isConnected: connected,
    isStale,
  };
};

export default useBalance;