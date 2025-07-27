import { useState, useCallback, useRef, useEffect } from 'react';
import { useWallet } from '@/components/WalletProvider';

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  type?: string;
  message?: string;
  gasUsed?: string;
  error?: string;
  blockNumber?: number;
}

export const useInjectiveTransactionStatus = () => {
  const { web3 } = useWallet();
  const [pendingTransactions, setPendingTransactions] = useState<TransactionStatus[]>([]);
  const [completedTransactions, setCompletedTransactions] = useState<TransactionStatus[]>([]);
  const pollingIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Track a new transaction
  const trackTransaction = useCallback(async (
    hash: string,
    type?: string,
    message?: string
  ) => {
    if (!web3) {
      console.error('Web3 not initialized');
      return;
    }

    const newTransaction: TransactionStatus = {
      hash,
      status: 'pending',
      timestamp: Date.now(),
      type,
      message,
    };

    setPendingTransactions(prev => [...prev, newTransaction]);

    // Start polling for transaction status
    const pollTransaction = async () => {
      try {
        const receipt = await web3.eth.getTransactionReceipt(hash);
        
        if (receipt) {
          // Transaction completed
          const completedTransaction: TransactionStatus = {
            ...newTransaction,
            status: receipt.status ? 'success' : 'failed',
            gasUsed: receipt.gasUsed?.toString(),
            blockNumber: receipt.blockNumber,
          };

          // Move from pending to completed
          setPendingTransactions(prev => prev.filter(tx => tx.hash !== hash));
          setCompletedTransactions(prev => [completedTransaction, ...prev.slice(0, 49)]); // Keep last 50

          // Clear polling interval
          const interval = pollingIntervals.current.get(hash);
          if (interval) {
            clearInterval(interval);
            pollingIntervals.current.delete(hash);
          }
        }
      } catch (error: any) {
        console.error('Error polling transaction:', error);
        
        // Check if transaction failed
        try {
          const tx = await web3.eth.getTransaction(hash);
          if (!tx) {
            // Transaction not found, mark as failed
            const failedTransaction: TransactionStatus = {
              ...newTransaction,
              status: 'failed',
              error: 'Transaction not found',
            };

            setPendingTransactions(prev => prev.filter(tx => tx.hash !== hash));
            setCompletedTransactions(prev => [failedTransaction, ...prev.slice(0, 49)]);

            const interval = pollingIntervals.current.get(hash);
            if (interval) {
              clearInterval(interval);
              pollingIntervals.current.delete(hash);
            }
          }
        } catch (txError) {
          console.error('Error checking transaction:', txError);
        }
      }
    };

    // Poll immediately, then every 3 seconds
    pollTransaction();
    const interval = setInterval(pollTransaction, 3000);
    pollingIntervals.current.set(hash, interval);

    // Cleanup after 10 minutes if still pending
    setTimeout(() => {
      const existingInterval = pollingIntervals.current.get(hash);
      if (existingInterval) {
        clearInterval(existingInterval);
        pollingIntervals.current.delete(hash);
        
        // Mark as failed if still pending
        setPendingTransactions(prev => {
          const tx = prev.find(t => t.hash === hash);
          if (tx) {
            const timedOutTransaction: TransactionStatus = {
              ...tx,
              status: 'failed',
              error: '交易超时',
            };
            setCompletedTransactions(prev => [timedOutTransaction, ...prev.slice(0, 49)]);
            return prev.filter(t => t.hash !== hash);
          }
          return prev;
        });
      }
    }, 10 * 60 * 1000); // 10 minutes
  }, [web3]);

  // Get transaction status
  const getTransactionStatus = useCallback((hash: string): TransactionStatus | null => {
    const pending = pendingTransactions.find(tx => tx.hash === hash);
    if (pending) return pending;

    const completed = completedTransactions.find(tx => tx.hash === hash);
    if (completed) return completed;

    return null;
  }, [pendingTransactions, completedTransactions]);

  // Clear specific transaction
  const clearTransaction = useCallback((hash: string) => {
    setPendingTransactions(prev => prev.filter(tx => tx.hash !== hash));
    setCompletedTransactions(prev => prev.filter(tx => tx.hash !== hash));
    
    const interval = pollingIntervals.current.get(hash);
    if (interval) {
      clearInterval(interval);
      pollingIntervals.current.delete(hash);
    }
  }, []);

  // Clear all completed transactions
  const clearCompletedTransactions = useCallback(() => {
    setCompletedTransactions([]);
  }, []);

  // Clear all transactions
  const clearAllTransactions = useCallback(() => {
    setPendingTransactions([]);
    setCompletedTransactions([]);
    
    // Clear all polling intervals
    pollingIntervals.current.forEach(interval => clearInterval(interval));
    pollingIntervals.current.clear();
  }, []);

  // Get recent transaction by type
  const getRecentTransactionByType = useCallback((type: string): TransactionStatus | null => {
    const allTransactions = [...pendingTransactions, ...completedTransactions];
    const filtered = allTransactions.filter(tx => tx.type === type);
    return filtered.length > 0 ? filtered[0] : null;
  }, [pendingTransactions, completedTransactions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      pollingIntervals.current.forEach(interval => clearInterval(interval));
      pollingIntervals.current.clear();
    };
  }, []);

  return {
    // Methods
    trackTransaction,
    getTransactionStatus,
    clearTransaction,
    clearCompletedTransactions,
    clearAllTransactions,
    getRecentTransactionByType,
    
    // State
    pendingTransactions,
    completedTransactions,
    hasPendingTransactions: pendingTransactions.length > 0,
    totalTransactions: pendingTransactions.length + completedTransactions.length,
  };
};

export default useInjectiveTransactionStatus;