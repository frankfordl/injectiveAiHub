"use client";

import React from 'react';
import { useWallet } from './WalletProvider';
import { switchToInjectiveTestnet } from '../utils/ethereum';

interface NetworkWarningProps {
  className?: string;
}

export const NetworkWarning: React.FC<NetworkWarningProps> = ({ className = '' }) => {
  const { networkError, isConnected, isInjectiveTestnet } = useWallet();

  const handleSwitchNetwork = async () => {
    try {
      await switchToInjectiveTestnet();
    } catch (error) {
      console.error('切换网络失败:', error);
    }
  };

  if (!networkError && (isConnected && isInjectiveTestnet)) {
    return null;
  }

  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-red-800">
            网络错误
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{networkError || '请连接到 Injective 测试网'}</p>
          </div>
          <div className="mt-3">
            <button
              onClick={handleSwitchNetwork}
              className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              切换到 Injective 测试网
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};