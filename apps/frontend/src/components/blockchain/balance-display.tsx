import React, { useState, useEffect } from 'react';
// 移除 Aptos 钱包引用
import { Card, CardBody, CardHeader, Button, Chip, Skeleton } from '@heroui/react';
import {
  RefreshCw,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Eye,
  EyeOff,
  ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BalanceData {
  totalBalance: number;
  availableBalance: number;
  stakedBalance: number;
  pendingRewards: number;
  claimableRewards: number;
  lastUpdated: Date;
}

interface BalanceDisplayProps {
  className?: string;
  showDetails?: boolean;
  compact?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number; // in seconds
}

export const BalanceDisplay: React.FC<BalanceDisplayProps> = ({
  className,
  showDetails = true,
  compact = false,
  autoRefresh = true,
  refreshInterval = 30,
}) => {
  // 移除 Aptos 钱包相关状态
  const [balanceData, setBalanceData] = useState<BalanceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPrivate, setShowPrivate] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  const fetchBalance = async (showLoading = true) => {
    // 移除钱包连接检查，直接显示未连接状态
    setBalanceData(null);
    return;
  };

  // 移除钱包相关的 useEffect
  useEffect(() => {
    fetchBalance();
  }, []);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchBalance(false); // Don't show loading on auto-refresh
    }, refreshInterval * 1000);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const handleRefresh = () => {
    fetchBalance(true);
  };

  const formatBalance = (amount: number, hideValue = false) => {
    if (hideValue) return '••••••';
    return `${amount.toFixed(4)} INJ`;
  };

  const openExplorer = () => {
    // 移除 Aptos 浏览器链接
    window.open('https://explorer.injective.network/', '_blank');
  };

  // 始终显示未连接状态
  return (
    <Card className={cn('w-full', className)}>
      <CardBody className="p-6">
        <div className="flex items-center justify-center h-32">
          <div className="text-center space-y-2">
            <Wallet className="mx-auto h-8 w-8 text-default-400" />
            <p className="text-sm text-default-400">Connect your wallet to view balance</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default BalanceDisplay;