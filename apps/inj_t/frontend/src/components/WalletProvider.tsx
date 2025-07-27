"use client";

import React, { createContext, useContext, useState, useEffect, PropsWithChildren } from 'react';
import Web3 from 'web3';
import { 
  switchToInjectiveTestnet, 
  INJECTIVE_TESTNET_CONFIG, 
  isAllowedNetwork,
  validateAndSwitchNetwork 
} from '../utils/ethereum';

interface WalletContextType {
  web3: Web3 | null;
  account: string | null;
  isConnected: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  chainId: number | null;
  isInjectiveTestnet: boolean;
  networkError: string | null;
}

const WalletContext = createContext<WalletContextType>({
  web3: null,
  account: null,
  isConnected: false,
  connectWallet: async () => {},
  disconnectWallet: () => {},
  chainId: null,
  isInjectiveTestnet: false,
  networkError: null,
});

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }: PropsWithChildren) => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);
  const [networkError, setNetworkError] = useState<string | null>(null);

  const isInjectiveTestnet = chainId === INJECTIVE_TESTNET_CONFIG.chainId;

  useEffect(() => {
    // 移除自动检查连接，只监听事件
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  // 监听网络变化，如果不是 Injective 测试网则断开连接
  useEffect(() => {
    if (isConnected && chainId && !isAllowedNetwork(chainId)) {
      setNetworkError('只允许连接到 Injective 测试网');
      disconnectWallet();
    } else if (isConnected && chainId && isAllowedNetwork(chainId)) {
      setNetworkError(null);
    }
  }, [chainId, isConnected]);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      // 账户断开连接时，完全清除状态
      disconnectWallet();
    } else {
      // 只有在已连接且网络正确时才更新账户
      if (isConnected && chainId && isAllowedNetwork(chainId)) {
        setAccount(accounts[0]);
      } else {
        // 如果网络不正确，断开连接
        disconnectWallet();
      }
    }
  };

  const handleChainChanged = async (chainIdHex: string) => {
    const newChainId = Number(chainIdHex);
    setChainId(newChainId);
    
    // 如果切换到不允许的网络，立即断开连接
    if (!isAllowedNetwork(newChainId)) {
      setNetworkError('只允许连接到 Injective 测试网');
      disconnectWallet();
      return;
    }
    
    // 如果是允许的网络且已连接，保持连接状态
    if (isConnected) {
      setNetworkError(null);
    }
  };

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        // 首先验证并切换到正确的网络
        await validateAndSwitchNetwork();
        
        // 请求连接账户
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        const web3Instance = new Web3(window.ethereum);
        const accounts = await web3Instance.eth.getAccounts();
        const chainId = await web3Instance.eth.getChainId();
        const currentChainId = Number(chainId);
        
        // 再次验证网络
        if (!isAllowedNetwork(currentChainId)) {
          throw new Error('只允许连接到 Injective 测试网');
        }
        
        // 验证账户
        if (accounts.length === 0) {
          throw new Error('未找到可用账户');
        }
        
        setWeb3(web3Instance);
        setAccount(accounts[0]);
        setIsConnected(true);
        setChainId(currentChainId);
        setNetworkError(null);
        
        console.log('钱包连接成功:', accounts[0]);
      } catch (error: any) {
        console.error('连接钱包失败:', error);
        setNetworkError(error.message || '连接钱包失败');
        // 连接失败时确保清除所有状态
        disconnectWallet();
        throw error;
      }
    } else {
      const errorMsg = '请安装 MetaMask 插件';
      setNetworkError(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const disconnectWallet = () => {
    console.log('钱包断开连接');
    
    // 完全清除所有状态
    setWeb3(null);
    setAccount(null);
    setIsConnected(false);
    setChainId(null);
    
    // 清除网络错误（如果是主动断开）
    if (!networkError || networkError.includes('只允许连接到')) {
      // 保留网络限制错误信息
    } else {
      setNetworkError(null);
    }
  };

  const value = {
    web3,
    account,
    isConnected,
    connectWallet,
    disconnectWallet,
    chainId,
    isInjectiveTestnet,
    networkError,
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};

declare global {
  interface Window {
    ethereum?: any;
  }
}