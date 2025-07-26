import { useState, useCallback, useRef, useEffect } from 'react';
import { Aptos, AptosConfig, Network } from '@aptos-labs/ts-sdk';

const NETWORK = (process.env.NEXT_PUBLIC_APTOS_NETWORK as Network) || Network.TESTNET;
const aptosConfig = new AptosConfig({ network: NETWORK });
const aptos = new Aptos(aptosConfig);

export interface TransactionStatus {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  timestamp: number;
  type?: string;
  message?: string;
  gasUsed?: string;
  error?: string;
}

export const useTransactionStatus = () => {
  const [pendingTransactions, setPendingTransactions] = useState<TransactionStatus[]>([]);
  const [completedTransactions, setCompletedTransactions] = useState<TransactionStatus[]>([]);
  const pollingIntervals = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Track a new transaction
  const trackTransaction = useCallback(async (
    hash: string,
    type?: string,
    message?: string
  ) => {
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
        const transaction = await aptos.waitForTransaction({
          transactionHash: hash,
        });

        // Transaction completed successfully
        const completedTransaction: TransactionStatus = {
          ...newTransaction,
          status: 'success',
          gasUsed: transaction.gas_used,
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
      } catch (error: any) {
        // Transaction failed
        const failedTransaction: TransactionStatus = {
          ...newTransaction,
          status: 'failed',
          error: error.message || 'Transaction failed',
        };

        // Move from pending to completed
        setPendingTransactions(prev => prev.filter(tx => tx.hash !== hash));
        setCompletedTransactions(prev => [failedTransaction, ...prev.slice(0, 49)]);

        // Clear polling interval
        const interval = pollingIntervals.current.get(hash);
        if (interval) {
          clearInterval(interval);
          pollingIntervals.current.delete(hash);
        }
      }
    };

    // Poll immediately, then every 2 seconds
    pollTransaction();
    const interval = setInterval(pollTransaction, 2000);
    pollingIntervals.current.set(hash, interval);

    // Cleanup after 5 minutes if still pending
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
              error: 'Transaction timed out',
            };
            setCompletedTransactions(prev => [timedOutTransaction, ...prev.slice(0, 49)]);
            return prev.filter(t => t.hash !== hash);
          }
          return prev;
        });
      }
    }, 5 * 60 * 1000); // 5 minutes
  }, []);

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

export default useTransactionStatus;